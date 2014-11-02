from boto.s3.connection import S3Connection
from django.conf import settings

def clear_keys(bucket_name, key_prefix):

    #Open the connection
    try:
        conn = S3Connection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
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
        conn = S3Connection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
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
        conn = S3Connection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
        bucket = conn.get_bucket(bucket_name)

        #Get a key and delete()
        key = bucket.get_key(key_name)

        if key and key.exists():
            return True

        return False

    except IOError as e:
        print("I/O error({0}): {1}".format(e.errno, e.strerror))
        return None