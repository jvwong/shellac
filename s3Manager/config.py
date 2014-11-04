from django.conf import settings
from .s3boto import S3BotoStorage

if settings.DEBUG:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='debug/media')
else:
    MediaRootS3BotoStorage = lambda: S3BotoStorage(location='media')
