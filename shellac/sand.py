import os

import boto
from boto.s3.key import Key

conn = boto.connect_s3()
bucket = conn.get_bucket('shellac-media')
k = Key(bucket)

###################
### small files
###################
# k.key = 'debug/media/sounds/2014/10/24/74c38ff170ac4c30b390f597d2d49052.mp3'
# dest = '/home/jvwong/Downloads/'
# fname = os.path.join(dest, os.path.split(k.key)[1])

### setting the value for a given key
# Notes: boto will attempt to determine the correct mime type for that file and
# send it as a Content-Type header. The boto package uses the standard mimetypes
# package in Python.  The other thing to note is that boto does stream the content to
# and from S3 so you should be able to send and receive large files without any problem.
# k.set_contents_from_filename('<path to local file>')

### retrieving a given key and saving locally
# k.get_contents_to_filename(fname)


# ###################
# ### larger file
# ###################
from filechunkio import FileChunkIO
import math

# Get file info
source_path = '/home/jvwong/Music/U2/Songs of Innocence/02 Every Breaking Wave.m4a'
source_name = os.path.split(source_path)[1]
source_size = os.stat(source_path).st_size

# set the key
key_prefix = '/debug/media/sounds/2014/10/30/'
dest_path = os.path.join(key_prefix, source_name)
k.key = dest_path

# Create a multipart upload request
mp = bucket.initiate_multipart_upload(k.key)

### Use a chunk size of 10 MiB (feel free to change this)
### The minimal multipart upload size is 5mb
chunk_size = 1048576 * 10 ##1MB
chunk_count = int(math.ceil(source_size / chunk_size))

# Send the file parts, using FileChunkIO to create a file-like object
# that points to a certain byte range within the original file. We
# set bytes to never exceed the original file size.
min_size = 5 * 1048576
if source_size > min_size:
    for i in range(chunk_count + 1):
        offset = chunk_size * i

        ##bytes will be chunk size OR leftover
        bytes = min(chunk_size, source_size - offset)

        with FileChunkIO(source_path, 'r', offset=offset, bytes=bytes) as fp:
            mp.upload_part_from_file(fp, part_num=i + 1)

    # Finish the upload
    # Note that if you forget to call either mp.complete_upload() or
    # mp.cancel_upload() you will be left with an incomplete upload
    mp.complete_upload()

else:
    k.set_contents_from_filename(source_path)

# print("key exists after?")
# print(k.key)
# print(bucket.get_key(k.key).name)