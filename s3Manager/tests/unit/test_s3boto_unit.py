import os

from django.test import TestCase
from django.core.files import File
from s3Manager.storage import FileSystemStorage

from unittest.mock import patch
from s3Manager.s3boto import S3BotoStorage, S3BotoStorageFile

# BEGIN User page unit testing
UNIT_DIR = os.path.abspath(os.path.dirname(__file__))
IMAGE_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../../fixtures/image.png")

class S3BotoStorage(TestCase):
    #fixtures = []

    def setUp(self):
        self.storage = S3BotoStorage()
        self.fs = FileSystemStorage
        self.content = self.fs.open(IMAGE_FILE, mode='rb')

    def test_can_instantiate_storage_object(self):
        self.assertIsInstance(self.storage, S3BotoStorage, msg="Is instance of S3BotoStorage")
        self.contentIsInstance(self.storage, File, msg="Is instance of S3BotoStorage")
