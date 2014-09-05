from django.test import TestCase
from shellac.models import Clip, Category
from django.contrib.auth.models import User
import os
from shellac.tests.utils.unit import cleanClips, setFileAttributefromLocal

UNIT_DIR = os.path.abspath(os.path.dirname(__file__))
brand_path = os.path.abspath(os.path.join(UNIT_DIR, "../assets/seventyEight.png"))
audio_path = os.path.abspath(os.path.join(UNIT_DIR, "../assets/song.mp3"))


def get_users():
    username1_dummy = 'andrea'
    password1_dummy = 'a'
    email1_dummy = 'aray@outlook.com'

    username2_dummy = 'jvwong'
    password2_dummy = 'j'
    email2_dummy = 'jray@outlook.com'

    user1 = User.objects.create_user(username1_dummy, password1_dummy, email1_dummy)
    user2 = User.objects.create_user(username2_dummy, password2_dummy, email2_dummy)

    users = [user1, user2]
    return users

class ClipModelTest(TestCase):

    def test_for_saving_and_retrieving_clips(self):
        c1 = Category.objects.create_category("cat1", "described cat1")
        c2 = Category.objects.create_category("cat2", "described cat2")

        users = get_users()
        clip1 = Clip.objects.create_clip("clip1", users[0])
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip1.categories = [c1]
        clip1.tags.add("red", "green")

        clip2 = Clip.objects.create_clip("clip2", users[1])
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        clip2.categories = [c2]
        clip2.tags.add("blue", "purple")

        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), 2)

        saved_clip_1 = saved_clips[0]
        self.assertEqual(saved_clip_1.title, 'clip1')
        self.assertEqual(saved_clip_1.author.username, 'andrea')
        self.assertEqual(saved_clip_1.description, '')
        self.assertEqual(saved_clip_1.plays, 0)
        self.assertEqual(saved_clip_1.rating, 0)
        self.assertEqual(saved_clip_1.status, Clip.PUBLIC_STATUS)
        self.assertEqual(saved_clip_1.slug, 'clip1')
        self.assertEqual(users[0].clips.all().count(), 1)
        self.assertEqual(users[0].clips.all()[0].title, 'clip1')
        #query on categories
        self.assertEqual(saved_clip_1.categories.all().count(), 1)
        self.assertEqual(saved_clip_1.categories.all()[0].slug, 'cat1')
        #query on tags returns a ValuesListQuery.list() will convert
        self.assertTrue('red' in list(saved_clip_1.tags.names()))
        self.assertTrue('green' in list(saved_clip_1.tags.names()))

        cleanClips()


