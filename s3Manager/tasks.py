import os
import sys
import math

from config import celery_app
from boto.s3.connection import S3Connection
from .filechunkio import FileChunkIO
from .storage import FileSystemStorage

sys.path.append('/home/jvwong/Projects/shellac')
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
from django.conf import settings
import django.dispatch
upload_done = django.dispatch.Signal(providing_args=["name"])

CHUNK_SIZE = 6 * 1048576
MIN_FILE_SIZE = 5 * 1048576


## upload_task upload a file to amazon s3 bucket
#
# Note that you must check several things
# t.ready() says there is some result
# get_task_status(id) tells you if there was a completion of the S3 connection
# t.info or t.result is a boolean telling you if there was a valid upload
@celery_app.task()
def upload_task(bucket_name, encoded_name, cleaned_name, file_buffer_size,
                content_type, reduced_redundancy, encryption, headers, acl):
    # Synchronous operation
        # Save to local file system (settings.MEDIA_ROOT)
        fs = FileSystemStorage()

        assert fs.exists(cleaned_name), 'file does not exist: {}'.format(cleaned_name)

        f = fs.open(cleaned_name)
        source_size = fs.size(cleaned_name)
        source_name = f.name

        conn = S3Connection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
        bucket = conn.get_bucket(bucket_name)

        ##Checks for the key existence
        key = bucket.get_key(encoded_name)
        if not key:
            key = bucket.new_key(encoded_name)

        key.content_type = content_type
        key.set_metadata('Content-Type', content_type)

        #Set metadata for multipart
        metadata = {}
        if content_type:
            metadata['Content-Type'] = content_type

        # upload to s3
        # Create a multipart upload request
        mp = bucket.initiate_multipart_upload(key.name,
                                              headers=headers,
                                              reduced_redundancy=reduced_redundancy,
                                              metadata=metadata,
                                              encrypt_key=encryption,
                                              policy=acl)

        ### floor is for celery bug (below)
        chunk_count = int(math.floor(source_size / CHUNK_SIZE))

        try:
            if source_size > file_buffer_size:
                # print('chunk upload...')
                for i in range(chunk_count):
                    offset = CHUNK_SIZE * i

                    ##bytes will be chunk size OR leftover; each chunk must be > MIN_FILE_SIZE
                    if i == chunk_count - 1:
                        num_bytes = source_size - offset
                    else:
                        num_bytes = min(CHUNK_SIZE, source_size - offset)

                    # print("i: {}".format(i))
                    # print("source_size - offset: {}".format(source_size - offset))
                    # print("num_bytes: {}".format(num_bytes))

                    # cb (function) – (optional) a callback function that will be called to report progress on the
                    # download. The callback should accept two integer parameters, the first representing the
                    # number of bytes that have been successfully transmitted from the storage service
                    # and the second representing the total number of bytes that need to be transmitted.

                    # num_cb (int) – (optional) If a callback is specified with the cb parameter this
                    # parameter determines the granularity of the callback by defining the maximum number of
                    # times the callback will be called during the file transfer.
                    with FileChunkIO(source_name, 'r', offset=offset, bytes=num_bytes) as fp:
                        mp.upload_part_from_file(fp,
                                                 part_num=i + 1,
                                                 replace=True,
                                                 cb=None,
                                                 num_cb=10,
                                                 md5=None,
                                                 size=None)

                # Note that if you forget to call either mp.complete_upload() or
                # mp.cancel_upload() you will be left with an incomplete upload
                # mp.complete_upload()
                # Finish the upload
                mp.complete_upload()
            else:
                # print('whole upload...')
                key.set_contents_from_file(f,
                                           headers=headers,
                                           policy=acl,
                                           rewind=True)

            return cleaned_name

        except IOError as ioe:
            print("I/O error: {}".format(ioe))

        except Exception as err:
            print("Uncaught exception({0}): {1}".format(err.errno, err.strerror))

        finally:
            f.close()



def get_upload_task_status(task_id):

    # If you have a task_id, this is how you query that task
    task = upload_task.AsyncResult(task_id)

    status = task.status
    result = task.result

    progress = 0

    if status == u'SUCCESS':
        progress = 100
    elif status == u'FAILURE':
        progress = 0
    elif status == 'PROGRESS':
        progress = task.info['progress']

    return {
        'status': status,
        'progress': progress,
        'result': result
    }


def upload_progress():
    print("")


@celery_app.task()
def handle_post_upload(cleaned_name):

    fs = FileSystemStorage()
    # delete local file
    if fs.exists(cleaned_name):
        fs.delete(cleaned_name)

    if not fs.exists(cleaned_name):
        upload_done.send(sender=fs.__class__, name=cleaned_name)


