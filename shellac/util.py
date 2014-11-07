import os
from io import BytesIO

from PIL import Image

from django.core.files import File
from django.db.models.fields.files import FieldFile
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _



def setFileAttributefromLocal(field, path, fname):
    with open(path, 'rb') as f:
        field.save(fname, File(f), save=False)

# thumbnailer converts the given file to the size, preserving the aspect ratio as a jpeg
def thumbnailer(filename, size):
    file, ext = os.path.splitext(filename)
    im = Image.open(filename)
    im.thumbnail(size, Image.ANTIALIAS)
    im.save(file + ".thumb.jpeg", "JPEG")

# transformer crops the largest square possible, centered on the image
def squarer(field, name):
    MIN_IMAGE_DIMENSIONS_PX = 25
    RESIZE_IMAGE_DIMENSIONS_PX = 512

    # field is instance of File, name instance of str
    assert isinstance(field, FieldFile) and isinstance(name, str), 'Invalid parameter type'

    # We need to get a file object. We might have a path or we might
    # have to read the data into memory.
    try:
        Image.open(field.file).verify()
    except IOError as e:
        # Pillow (or PIL) doesn't recognize it as an image.
        print(e)
    if hasattr(field.file, 'seek') and callable(field.file.seek):
        field.file.seek(0)

    buffer = 5
    f = BytesIO()
    try:
        im = Image.open(field)
        if im.size[0] < MIN_IMAGE_DIMENSIONS_PX or im.size[1] < MIN_IMAGE_DIMENSIONS_PX:
            raise AttributeError("Image is too small")

        im.thumbnail((RESIZE_IMAGE_DIMENSIONS_PX, RESIZE_IMAGE_DIMENSIONS_PX), Image.ANTIALIAS)
        width, height = im.size

        mind = min(width, height) - buffer
        center_w = round(width / 2)
        center_h = round(height / 2)
        span = round(mind / 2)
        box = (center_w - span, center_h - span, center_w + span, center_h + span) #left, upper, right, lower
        region = im.crop(box)
        region.save(f, format='JPEG')
        s = f.getvalue()
        field.save(name, ContentFile(s), save=False)

    except AttributeError as err:
        print(err)

    except Exception as err:
        print(err)

    finally:
        f.close()

import datetime

def datetime_title_default():
    now = datetime.datetime.now()
    return now.strftime("%Y_%m_%d_%H%M%S")