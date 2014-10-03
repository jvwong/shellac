from django.db import models
from django import forms
from django.db.models.fields.files import ImageFileDescriptor, ImageField, ImageFieldFile
from django.core.exceptions import ImproperlyConfigured
from django.core import checks
from django.db.models import signals
from django.utils.translation import ugettext_lazy as _

class ThumbnailImageField(models.FileField):
    attr_class = ImageFieldFile
    descriptor_class = ImageFileDescriptor
    description = _("Image")

    def __init__(self, verbose_name=None, name=None, width_field=None, height_field=None, **kwargs):
        self.width_field, self.height_field = width_field, height_field
        super(ThumbnailImageField, self).__init__(verbose_name, name, **kwargs)

    def check(self, **kwargs):
        errors = super(ThumbnailImageField, self).check(**kwargs)
        errors.extend(self._check_image_library_installed())
        return errors

    def _check_image_library_installed(self):
        try:
            from django.utils.image import Image  # NOQA
        except ImproperlyConfigured:
            return [
                checks.Error(
                    'Cannot use ImageField because Pillow is not installed.',
                    hint=('Get Pillow at https://pypi.python.org/pypi/Pillow '
                          'or run command "pip install pillow".'),
                    obj=self,
                    id='fields.E210',
                )
            ]
        else:
            return []

    def deconstruct(self):
        name, path, args, kwargs = super(ThumbnailImageField, self).deconstruct()
        if self.width_field:
            kwargs['width_field'] = self.width_field
        if self.height_field:
            kwargs['height_field'] = self.height_field
        return name, path, args, kwargs

    def contribute_to_class(self, cls, name):
        super(ThumbnailImageField, self).contribute_to_class(cls, name)
        # Attach update_dimension_fields so that dimension fields declared
        # after their corresponding image field don't stay cleared by
        # Model.__init__, see bug #11196.
        # Only run post-initialization dimension update on non-abstract models
        if not cls._meta.abstract:
            signals.post_init.connect(self.update_dimension_fields, sender=cls)

    def update_dimension_fields(self, instance, force=False, *args, **kwargs):
        """
        Updates field's width and height fields, if defined.

        This method is hooked up to model's post_init signal to update
        dimensions after instantiating a model instance.  However, dimensions
        won't be updated if the dimensions fields are already populated.  This
        avoids unnecessary recalculation when loading an object from the
        database.

        Dimensions can be forced to update with force=True, which is how
        ImageFileDescriptor.__set__ calls this method.
        """
        # Nothing to update if the field doesn't have dimension fields.
        has_dimension_fields = self.width_field or self.height_field
        if not has_dimension_fields:
            return

        # getattr will call the ImageFileDescriptor's __get__ method, which
        # coerces the assigned value into an instance of self.attr_class
        # (ImageFieldFile in this case).
        file = getattr(instance, self.attname)

        # Nothing to update if we have no file and not being forced to update.
        if not file and not force:
            return

        dimension_fields_filled = not(
            (self.width_field and not getattr(instance, self.width_field))
            or (self.height_field and not getattr(instance, self.height_field))
        )
        # When both dimension fields have values, we are most likely loading
        # data from the database or updating an image field that already had
        # an image stored.  In the first case, we don't want to update the
        # dimension fields because we are already getting their values from the
        # database.  In the second case, we do want to update the dimensions
        # fields and will skip this return because force will be True since we
        # were called from ImageFileDescriptor.__set__.
        if dimension_fields_filled and not force:
            return

        # file should be an instance of ImageFieldFile or should be None.
        if file:
            width = file.width
            height = file.height
        else:
            # No file, so clear dimensions fields.
            width = None
            height = None

        # Update the width and height fields.
        if self.width_field:
            setattr(instance, self.width_field, width)
        if self.height_field:
            setattr(instance, self.height_field, height)

    def formfield(self, **kwargs):
        defaults = {'form_class': forms.ImageField}
        defaults.update(kwargs)
        return super(ThumbnailImageField, self).formfield(**defaults)


