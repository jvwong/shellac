import os
from django.core.files import File
from shellac.models import Clip, Category

def setFileAttributefromLocal(field, path, fname):
    with open(path, 'rb') as f:
        field.save(fname, File(f), save=True)


brand_path = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/beatles.jpg'))
brand_path2 = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/black.jpg'))
brand_path3 = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/purple.jpg'))
brand_path5 = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/victor.jpg'))

audio_path = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/water.mp3'))
audio_path2 = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'tests/assets/heart.mp3'))


def autopopulate_clips(author, num):
    Category.objects.autopopulate()

    for ind in range(num):
        title = 'clip' + str(ind)
        clip = Clip.objects.create_clip(title, author)

        if(ind % 2 == 0):
            brand = brand_path
            audio = audio_path
        else:
            brand = brand_path2
            audio = audio_path2

        setFileAttributefromLocal(clip.audio_file, audio, 'test.mp3')
        setFileAttributefromLocal(clip.brand, brand, 'test.jpg')
