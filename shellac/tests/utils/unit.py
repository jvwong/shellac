from django.contrib.auth import get_user_model
User = get_user_model()
from shellac.models import Clip

def cleanClips():
    for c in Clip.objects.all():
        c.delete()

# The file reference must be populated with a django.core.files.File instance
# but File cannot handle file-like objects such as those returned by urlopen -
# see http://code.djangoproject.com/ticket/8501
#
# Since we'd like to get the normal file name collision avoidance, automatic
# location handling, etc. we'll create a django NamedTemporaryFile because the
# default file storage save logic is smart enough to simply move the temporary
# file to the correct location.

from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from urllib.request import urlopen

def setFileAttributefromUrl(field, url, fname):
    f_temp = NamedTemporaryFile(delete=True)
    f_temp.write(urlopen(url).read())
    f_temp.flush()
    field.save(fname, File(f_temp), save=True)


def setFileAttributefromLocal(field, path, fname):
    with open(path, 'rb') as f:
        field.save(fname, File(f), save=True)
