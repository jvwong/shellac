import os
import logging

import django
from django.db import models
from django.db.models.signals import pre_save, post_delete, post_save
from django.conf import settings

from .utils import clear_a_key, key_exists
from s3Manager.tasks import upload_task, get_upload_task_status


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


def remove_remote_files(sender, instance, **kwargs):
    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue

        file_to_delete = getattr(instance, field.name)

        if not file_to_delete:
            continue

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        key_name = "{}{}".format(debug_prefix, file_to_delete.url)

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

            except IOError:
                logger.exception("IOError delete old file {}".format(old_file.name))


def upload_created_files(sender, instance, created, raw, using, update_fields, **kwargs):
    debug_prefix = ""
    if settings.DEBUG:
        debug_prefix = "debug"

    if not instance.pk:
        return

    for field in instance._meta.fields:
        if not isinstance(field, models.FileField):
            continue

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        new_file = getattr(instance, field.name)

        if not new_file:
            continue

        key_name = "{}{}".format(debug_prefix, new_file.url)

        if not key_exists(bucket_name, key_name):
            path = os.path.normpath(settings.BASE_DIR + new_file.url)
            if os.path.isfile(path):
                task = upload_task.delay(bucket_name,
                                         path,
                                         "{}{}".format(debug_prefix, os.path.split(new_file.url)[0]))

                print(get_upload_task_status(task.id))
                logger.info("celery upload task: {}".format(get_upload_task_status(task.id)))


def connect_signals():
    if settings.USE_S3:
        for model in find_models_with_filefield():
            pre_save.connect(remove_orphan_remote_files, sender=model)
            post_save.connect(upload_created_files, sender=model)
            post_delete.connect(remove_remote_files, sender=model)


if django.VERSION < (1, 7):
    connect_signals()


# ### Using pre_save is fundamentally unsound as the upload_to file may not be set
# ### https://docs.djangoproject.com/en/1.7/releases/1.1/#names-of-uploaded-files-are-available-later
# ### Problem - I need the old instance but the saved filename???????
# #### Alternative is to re-upload ALL files on update - inefficient but no way around this right now
# @receiver(pre_save, sender=Clip)
# def upload_updated_files(sender, instance, raw, using, update_fields, **kwargs):
#     if not instance.pk:
#         return
#
#     try:
#         old_instance = instance.__class__.objects.get(pk=instance.pk)
#     except instance.DoesNotExist:
#         return
#
#     for field in instance._meta.fields:
#         if not isinstance(field, models.FileField):
#             continue
#
#         old_file = getattr(old_instance, field.name)
#         new_file = getattr(instance, field.name)
#
#         bucket_name = settings.AWS_STORAGE_BUCKET_NAME
#         key_name = "{}{}".format(debug_prefix, new_file.url)
#
#         new_name = path_and_rename(path)
#
#         if old_file != new_file and not key_exists(bucket_name, key_name):
#             try:
#                 print("updating...")
#                 #Case I: created so upload
#                 path = os.path.normpath(settings.BASE_DIR + new_file.url)
#                 if os.path.isfile(path):
#                     task = upload_task.delay(bucket_name,
#                                              path,
#                                              "{}{}".format(debug_prefix, os.path.split(new_file.url)[0]))
#                     print(get_upload_task_status(task.id))
#             except IOError:
#                 logger.exception("IOError update file {}".format(old_file.name))