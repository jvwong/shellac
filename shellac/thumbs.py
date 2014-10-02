from PIL import Image
import os

# thumbnailer converts the given file to the size, preserving the aspect ratio as a jpeg
def thumbnailer(filename, size):
    file, ext = os.path.splitext(filename)
    im = Image.open(filename)
    im.thumbnail(size, Image.ANTIALIAS)
    im.save(file + ".thumb.jpeg", "JPEG")

# transformer crops the largest square possible, centered on the image
def squarer(filename):
    buffer = 5
    file, ext = os.path.splitext(filename)
    im = Image.open(filename)
    width, height = im.size
    mind = min(width, height) - buffer
    center_w = round(width / 2)
    center_h = round(height / 2)
    span = round(mind / 2)
    box = (center_w - span, center_h - span, center_w + span, center_h + span) #left, upper, right, lower
    region = im.crop(box)
    region.save(file + "_cropped.jpeg", "JPEG")

# thumbnailer('tumblr.png', (512, 512))
# squarer('beach.jpg')