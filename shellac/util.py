import os
from PIL import Image
from django.core.files import File
from io import BytesIO
from django.core.files.base import ContentFile


def setFileAttributefromLocal(field, path, fname):
    with open(path, 'rb') as f:
        field.save(fname, File(f), save=True)

# thumbnailer converts the given file to the size, preserving the aspect ratio as a jpeg
def thumbnailer(filename, size):
    file, ext = os.path.splitext(filename)
    im = Image.open(filename)
    im.thumbnail(size, Image.ANTIALIAS)
    im.save(file + ".thumb.jpeg", "JPEG")

# transformer crops the largest square possible, centered on the image
def squarer(instance):
    buffer = 5
    f = BytesIO()
    try:
        im = Image.open(instance.brand)
        im.thumbnail((512, 512), Image.ANTIALIAS)
        width, height = im.size
        mind = min(width, height) - buffer
        center_w = round(width / 2)
        center_h = round(height / 2)
        span = round(mind / 2)
        box = (center_w - span, center_h - span, center_w + span, center_h + span) #left, upper, right, lower
        region = im.crop(box)
        region.save(f, format='JPEG')
        s = f.getvalue()
        instance.brand_thumb.save(instance.brand.name, ContentFile(s), save=True)

    except IOError:
        print("Image decoding error")
    finally:
        f.close()

