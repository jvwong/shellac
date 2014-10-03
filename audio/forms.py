"""
Field classes.
"""

from __future__ import unicode_literals
import sys
import os
from io import BytesIO

from django.core.exceptions import ValidationError
from django.utils import six
from django.utils.translation import ugettext_lazy as _
from django.forms.fields import FileField

AUDIO_EXT_WHITELIST = ('.mp3', '.wav', '.ogg')

class AudioField(FileField):
    default_error_messages = {
        'invalid_audio': _("Upload a valid audio file. The file you uploaded was either not valid audio type or corrupt"),
    }

    def to_python(self, data):
        """
        Checks that the file-upload field data contains a valid image (GIF, JPG,
        PNG, possibly others -- whatever the Python Imaging Library supports).
        """
        f = super(AudioField, self).to_python(data)

        #f, data are InMemoryUploadedFile --> UploadedFile --> File
        if f is None:
            return None

        #simple, basic file extension validation. Check file contents eventually
        file, ext = os.path.splitext(f.name)
        if ext not in AUDIO_EXT_WHITELIST:
            six.reraise(ValidationError, ValidationError(
                self.error_messages['invalid_audio'],
                code='invalid_audio',
            ), sys.exc_info()[2])

        # We need to get a file object. We might have a path or we might
        # have to read the data into memory.
        # if hasattr(data, 'temporary_file_path'):
        #     file = data.temporary_file_path()
        # else:
        #     if hasattr(data, 'read'):
        #         file = BytesIO(data.read())
        #     else:
        #         file = BytesIO(data['content'])
        #
        #
        # try:
        #     # load() could spot a truncated JPEG, but it loads the entire
        #     # image in memory, which is a DoS vector. See #3848 and #18520.
        #     # verify() must be called immediately after the constructor.
        #     Image.open(file).verify()
        # except Exception:
        #     # Pillow (or PIL) doesn't recognize it as an image.
        #     six.reraise(ValidationError, ValidationError(
        #         self.error_messages['invalid_image'],
        #         code='invalid_image',
        #     ), sys.exc_info()[2])
        # if hasattr(f, 'seek') and callable(f.seek):
        #     f.seek(0)
        return f