import os
import logging
import django
from django.db import models
from django.db.models.signals import pre_save, post_delete

from django.conf import settings

from shellac.tasks import clear_a_key, key_exists

debug_prefix = ""
if settings.DEBUG:
    debug_prefix = "debug"

logger = logging.getLogger(__name__)


def find_models_with_filefield(): 
    result = []
    for model in models.get_models():
        for field in model._meta.fields:
            if isinstance(field, models.FileField):
                result.append(model)
                break
    return result


### Remove previously associated files
def remove_old_files(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_instance = instance.__class__.objects.get(pk=instance.pk)
    except instance.DoesNotExist:
        return

    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue
        old_file = getattr(old_instance, field.name)
        new_file = getattr(instance, field.name)
        storage = old_file.storage
        if old_file and old_file != new_file and storage and storage.exists(old_file.name):
            try:
                storage.delete(old_file.name)
            except Exception:
                logger.exception("Unexpected exception while attempting to delete old file '%s'" % old_file.name)


### Remove currently associated files
def remove_files(sender, instance, **kwargs):
    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue
        file_to_delete = getattr(instance, field.name)
        storage = file_to_delete.storage
        if file_to_delete and storage and storage.exists(file_to_delete.name):
            try:
                storage.delete(file_to_delete.name)
            except Exception:
                logger.exception("Unexpected exception while attempting to delete file '%s'" % file_to_delete.name)


def remove_remote_files(sender, instance, **kwargs):
    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue

        file_to_delete = getattr(instance, field.name)

        if not file_to_delete:
            continue

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        key_name = "{}{}".format(debug_prefix, file_to_delete.url)

        # print(field.name) ## i.e 'brand', 'audio_file'
        # print(file_to_delete) ## brands/2014/10/31/laksdjasdjasd.jpg
        # print(file_to_delete.url) ## /media/brands/2014/10/31/laksdjasdjasd.jpg
        # print(key_exists(bucket_name, key_name))

        if file_to_delete and key_exists(bucket_name, key_name):
            try:
                ##NB: leading slash in key name???
                clear_a_key(bucket_name, key_name)
            except IOError:
                logger.exception("IOError delete file {}".format(file_to_delete.name))


def remove_orphan_remote_files(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_instance = instance.__class__.objects.get(pk=instance.pk)
    except instance.DoesNotExist:
        return

    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue
        old_file = getattr(old_instance, field.name)
        new_file = getattr(instance, field.name)
        #storage = old_file.storage

        if not old_file:
            continue

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        key_name = "{}{}".format(debug_prefix, old_file.url)

        if old_file != new_file and key_exists(bucket_name, key_name):
            try:
                #storage.delete(old_file.name)
                ##NB: leading slash in key name???
                clear_a_key(bucket_name, key_name)
                pass

            except IOError:
                logger.exception("IOError delete old file {}".format(old_file.name))


def connect_signals():
    for model in find_models_with_filefield():
        pre_save.connect(remove_old_files, sender=model)
        post_delete.connect(remove_files, sender=model)
        pre_save.connect(remove_orphan_remote_files, sender=model)
        post_delete.connect(remove_remote_files, sender=model)



if django.VERSION < (1, 7):
    connect_signals()
