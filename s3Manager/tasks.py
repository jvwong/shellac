import os
import sys
import math

from boto.s3.connection import S3Connection
from boto.s3.key import Key
from config import celery_app
from .filechunkio import FileChunkIO

sys.path.append('/home/jvwong/Projects/shellac')
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
from django.conf import settings

CHUNK_SIZE = 6 * 1048576
MIN_FILE_SIZE = 5 * 1048576


## upload_task upload a file to amazon s3 bucket
#
# Note that you must check several things
# t.ready() says there is some result
# get_task_status(id) tells you if there was a completion of the S3 connection
# t.info or t.result is a boolean telling you if there was a valid upload
@celery_app.task()
def upload_task(bucket_name, source_path, key_prefix):
    #Open the connection
    try:
        # conn = boto.connect_s3()
        conn = S3Connection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)

        #Retrieve the bucket and Key object
        bucket = conn.get_bucket(bucket_name)
        k = Key(bucket)

        #Format Get file info
        if os.path.split(source_path)[1] == '':
            return
        source_filename = os.path.split(source_path)[1]

        source_size = os.stat(source_path).st_size
        if source_size == 0:
            return

        #Set the key name from the destination path
        dest_path = os.path.join(key_prefix, source_filename)
        k.key = dest_path

        #print(k.key)

        # Create a multipart upload request
        mp = bucket.initiate_multipart_upload(k.key)

        ### Use a chunk size of 10 MiB (feel free to change this)
        ### The minimal multipart upload size is 5mb

        #chunk_count = int(math.ceil(source_size / CHUNK_SIZE))

        ### floor is for celery bug (below)
        chunk_count = int(math.floor(source_size / CHUNK_SIZE))

        # Send the file parts, using FileChunkIO to create a file-like object
        # that points to a certain byte range within the original file. We
        # set bytes to never exceed the original file size.

        if source_size > MIN_FILE_SIZE:
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
                with FileChunkIO(source_path, 'r', offset=offset, bytes=num_bytes) as fp:
                    mp.upload_part_from_file(fp, part_num=i + 1)

            # Finish the upload
            # Note that if you forget to call either mp.complete_upload() or
            # mp.cancel_upload() you will be left with an incomplete upload
            mp.complete_upload()

        else:
            k.set_contents_from_filename(source_path)

        return True

    except IOError as e:
        print("I/O error({0}): {1}".format(e.errno, e.strerror))
        return False


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


##Debugging
# from s3Manager.tasks import *;from s3Manager.utils import *
# bucket_name = 'shellac-media'
# source_path = '/home/jvwong/Music/Grantland Pop Culture/koppelman_2014-09-02_adamDuritz.mp3'
# key_prefix = 'debug/media/sounds/2014/11/01'
# key_name = os.path.join(key_prefix, os.path.split(source_path)[1])

