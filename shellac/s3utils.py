from django.conf import settings
"""Custom S3 storage backends to store files in subfolders."""
from storages.backends.s3boto import S3BotoStorage


if settings.DEBUG:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='debug/media')
else:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='media')
