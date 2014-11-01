import boto

from django.conf import settings
from storages.backends.s3boto import S3BotoStorage


if settings.DEBUG:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='debug/media')
else:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='media')


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