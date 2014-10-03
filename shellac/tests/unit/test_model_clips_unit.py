from django.test import TestCase
from shellac.models import Clip, Category
from django.contrib.auth.models import User
import os
from shellac.tests.utils.unit import cleanClips, setFileAttributefromLocal

UNIT_DIR = os.path.abspath(os.path.dirname(__file__))
brand_path = os.path.abspath(os.path.join(UNIT_DIR, "../assets/seventyEight.png"))
audio_path = os.path.abspath(os.path.join(UNIT_DIR, "../assets/song.mp3"))
audio_path_invalid = os.path.abspath(os.path.join(UNIT_DIR, "../assets/song_invalid.3gpp"))


class ClipModelTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.numClips =  Clip.objects.all().count()

    def test_saving_and_retrieving_clips(self):
        clip1 = Clip.objects.create_clip("clip_test_1", self.person)
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip1.categories.add(Category.objects.get(title="MUSIC"))
        clip1.tags.add("red", "green")

        clip2 = Clip.objects.create_clip("clip_test_2", self.person)
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        clip2.categories.add(Category.objects.get(title="TECHNOLOGY"))
        clip2.tags.add("blue", "purple")

        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), self.numClips + 2)

        saved_clip_1 = Clip.objects.filter(author=self.person, title="clip_test_1")[0]
        self.assertEqual(saved_clip_1.title, 'clip_test_1')
        self.assertEqual(saved_clip_1.author.username, 'aray')
        self.assertEqual(saved_clip_1.description, '')
        self.assertEqual(saved_clip_1.plays, 0)
        self.assertEqual(saved_clip_1.rating, 0)
        self.assertEqual(saved_clip_1.status, Clip.PUBLIC_STATUS)
        self.assertEqual(saved_clip_1.slug, 'clip_test_1')
        #query on categories
        self.assertEqual(saved_clip_1.categories.all().count(), 1)
        self.assertEqual(saved_clip_1.categories.all()[0].slug, 'music')
        #query on tags returns a ValuesListQuery.list() will convert
        self.assertTrue('red' in list(saved_clip_1.tags.names()))
        self.assertTrue('green' in list(saved_clip_1.tags.names()))

        cleanClips()

    def test_reject_invalid_file_type(self):
        clip1 = Clip.objects.create_clip("clip_test_1", self.person)
        setFileAttributefromLocal(clip1.audio_file, audio_path_invalid, "clip_invalid.3gpp")
        clip1.categories.add(Category.objects.get(title="MUSIC"))
        clip1.tags.add("red", "green")

        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), self.numClips)

        # saved_clip_1 = Clip.objects.filter(author=self.person, title="clip_test_1")[0]
        cleanClips()


