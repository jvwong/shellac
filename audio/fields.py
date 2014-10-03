import os
from django import forms
from django.db.models.fields.files import FileField
from django.core.exceptions import ImproperlyConfigured
from django.db.models import signals
from django.utils.translation import ugettext_lazy as _
from django.core import exceptions, validators, checks

from audio.files import AudioFileDescriptor, AudioFieldFile
from audio import forms

from django.conf import settings


class AudioField(FileField):
    default_error_messages = {
        'invalid_audio': _("Upload a valid audio file. The file you uploaded was either not valid audio type or corrupt"),
    }

    attr_class = AudioFieldFile
    descriptor_class = AudioFileDescriptor
    description = _("Audio")

    def __init__(self, **kwargs):
        super(AudioField, self).__init__(**kwargs)

    def check(self, **kwargs):
        errors = super(AudioField, self).check(**kwargs)
        #errors.extend(self._check_valid())
        return errors

    def _check_valid(self):
        try:
            pass
        except ImproperlyConfigured:
            return [
                checks.Error(
                    'Invalid',
                    hint=('some hint'),
                    obj=self,
                    id='fields.E210',
                )
            ]
        else:
            return []

    def deconstruct(self):
        name, path, args, kwargs = super(AudioField, self).deconstruct()
        return name, path, args, kwargs

    def validate(self, value, model_instance):
        """
        Validates value and throws ValidationError. Here, value is a
        AudioFieldFile instance
        """
        #simple, basic file extension validation. Check file contents eventually
        file, ext = os.path.splitext(value.name)
        #print("file: %s, ext: %s" % (file, ext))

        if ext not in settings.AUDIO_EXT_WHITELIST:
            raise exceptions.ValidationError(
                self.error_messages['invalid_audio'],
                code='invalid_audio',
                params={'value': value},
            )

        super(AudioField, self).validate(value, model_instance)

    def clean(self, value, model_instance):
        """
        Convert the value's type and run validation. Validation errors
        from to_python and validate are propagated. The correct value is
        returned if no error is raised.
        """
        value = self.to_python(value)
        self.validate(value, model_instance)
        self.run_validators(value)
        return value

    def contribute_to_class(self, cls, name):
        super(AudioField, self).contribute_to_class(cls, name)
        # Attach update_dimension_fields so that dimension fields declared
        # after their corresponding image field don't stay cleared by
        # Model.__init__, see bug #11196.
        # Only run post-initialization dimension update on non-abstract models
        if not cls._meta.abstract:
            signals.post_init.connect(self.update_meta_fields, sender=cls)

    def update_meta_fields(self, instance, force=False, *args, **kwargs):
        """
        Updates field's width and height fields, if defined.

        This method is hooked up to model's post_init signal to update
        meta after instantiating a model instance.  However, meta
        won't be updated if fields are already populated.  This
        avoids unnecessary recalculation when loading an object from the
        database.

        Can be forced to update with force=True, which is how
        ImageFileDescriptor.__set__ calls this method.
        """
        pass

    def formfield(self, **kwargs):
        defaults = {'form_class': forms.AudioField}
        return super(AudioField, self).formfield(**defaults)

