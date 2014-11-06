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


@celery_app.task()
def upload_task(bucket_name, encoded_name, cleaned_name, chunk_size, file_buffer_size,
                content_type, reduced_redundancy, encryption, headers, acl):

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
    chunk_count = int(math.floor(source_size / chunk_size))

    try:
        if source_size > file_buffer_size:
            # print('chunk upload...')
            for i in range(chunk_count):
                offset = chunk_size * i

                if i == chunk_count - 1:
                    num_bytes = source_size - offset
                else:
                    num_bytes = min(chunk_size, source_size - offset)

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
                                             cb=upload_task_progress,
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

    except IOError as ioe:
        print("I/O error: {}".format(ioe))
        return None

    except Exception as err:
        print("Uncaught exception: {}".format(err))
        return None
    else:
        #success
        return cleaned_name

    finally:
        #always
        f.close()


### progress callback
def upload_task_progress(bytes_transferred, total):
    print("transferred {} of {} bytes".format(bytes_transferred, total))

### Executed in the process that sent the task (sub)
import django.dispatch
from celery.signals import task_success
upload_done = django.dispatch.Signal(providing_args=["name"])

@task_success.connect(sender=upload_task)
def upload_task_success_handler(**kwargs):
    print('upload_task_success_handler kwargs: {}'.format(kwargs))

    fs = FileSystemStorage()
    result = kwargs['result']

    # delete local file
    if result and fs.exists(result):
        fs.delete(result)

    if not fs.exists(result):
        upload_done.send(sender=upload_task, name=result)


### Executed in the process that sent the task (sub)
from celery.signals import task_failure
@task_failure.connect(sender=upload_task)
def upload_task_failure_handler(**kwargs):
    print('upload_task_failure_handler kwargs: {}'.format(kwargs))