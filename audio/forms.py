"""
Field classes.
"""

from __future__ import unicode_literals
import sys
import mimetypes
import os
from io import BytesIO

from django.core.files import File
from django.core.exceptions import ValidationError
from django.utils import six
from django.utils.translation import ugettext_lazy as _
from django.forms.fields import FileField
from django.conf import settings


class AudioField(FileField):

    default_error_messages = {
        'invalid_audio': _("Upload a valid audio file. The file you uploaded was either not valid audio type or corrupt"),
    }

    def to_python(self, data):
        """
        Checks that the file-upload field data contains a valid image (GIF, JPG,
        PNG, possibly others -- whatever the Python Imaging Library supports).
        """

        default_whitelist = {
            'EXTENSIONS': ('.mp3', '.wav', '.ogg'),
            'MIMETYPES': ('audio/mpeg', 'audio/x-wav', 'audio/ogg')
        }

        f = super(AudioField, self).to_python(data)

        # Ensure that we are getting a File object
        assert f is not None and isinstance(f, File), 'Invalid arguments'

        # get the whitelist or defaults
        whitelist = getattr(settings, 'AUDIO_WHITELIST', default_whitelist)
        whitelisted_mimetypes = whitelist.get('MIMETYPES', ())
        whitelisted_extensions = whitelist.get('EXTENSIONS', ())

        #validate mimetype
        mimetype, encoding = mimetypes.guess_type(f.name)

        if mimetype not in whitelisted_mimetypes:
            six.reraise(ValidationError,
                        ValidationError(self.error_messages['invalid_audio'], code='invalid_audio'),
                        sys.exc_info()[2])


        #validate extension
        file, ext = os.path.splitext(f.name)
        if ext not in whitelisted_extensions:
            six.reraise(ValidationError,
                        ValidationError(self.error_messages['invalid_audio'], code='invalid_audio'),
                        sys.exc_info()[2])
        return f