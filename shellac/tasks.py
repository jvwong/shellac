import os
import sys
import math
import boto

from boto.s3.key import Key
from config import celery_app
from shellac.filechunkio import FileChunkIO

sys.path.append('/home/jvwong/Projects/shellac')
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
from django.conf import settings

CHUNK_SIZE = 1048576 * 10
MIN_FILE_SIZE = 6 * 1048576


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
        conn = boto.connect_s3()

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

        # Create a multipart upload request
        mp = bucket.initiate_multipart_upload(k.key)

        ### Use a chunk size of 10 MiB (feel free to change this)
        ### The minimal multipart upload size is 5mb
        chunk_count = int(math.ceil(source_size / CHUNK_SIZE))

        # Send the file parts, using FileChunkIO to create a file-like object
        # that points to a certain byte range within the original file. We
        # set bytes to never exceed the original file size.

        if source_size > MIN_FILE_SIZE:
            for i in range(chunk_count + 1):
                offset = CHUNK_SIZE * i

                ##bytes will be chunk size OR leftover
                bytes = min(CHUNK_SIZE, source_size - offset)

                with FileChunkIO(source_path, 'r', offset=offset, bytes=bytes) as fp:
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


def clear_keys(bucket_name, key_prefix):

    #Open the connection
    try:
        conn = boto.connect_s3()
        bucket = conn.get_bucket(bucket_name)

        #Get a list of keys and delete()
        for key in bucket.list(prefix=key_prefix):
            key.delete()

        return True

    except IOError as e:
        print("I/O error({0}): {1}".format(e.errno, e.strerror))
        return False


def clear_a_key(bucket_name, key_name):

    #Open the connection
    try:
        conn = boto.connect_s3()
        bucket = conn.get_bucket(bucket_name)

        #Get a key and delete()
        key = bucket.delete_key(key_name)

        if key.exists():
            return False

        return True

    except IOError as e:
        print("I/O error({0}): {1}".format(e.errno, e.strerror))
        return False


def key_exists(bucket_name, key_name):

    #Open the connection
    try:
        conn = boto.connect_s3()
        bucket = conn.get_bucket(bucket_name)

        #Get a key and delete()
        key = bucket.delete_key(key_name)

        return key.exists()

    except IOError as e:
        print("I/O error({0}): {1}".format(e.errno, e.strerror))
        return None

bname = 'shellac-media'
lspath = '/home/jvwong/Music/U2/Songs of Innocence/02 Every Breaking Wave.m4a'
spath = '/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/tests/assets/water.mp3'
kprefix = '/debug/media/sounds/2014/10/30/'
#
###Fire off a task
# t = upload_task.delay(bname, spath, kprefix)


###starting celery daemon
### celery --app=config.celery:app worker --loglevel=INFO