from django.test import TestCase
from shellac.models import Clip, Category
from django.contrib.auth.models import User
from django.conf import settings
import os
from shellac.tests.utils.base import cleanClips

brand_path = os.path.abspath(os.path.join(settings.STATIC_ROOT, "../source/shellac/tests/assets/seventyEight.png"))
audio_path = os.path.abspath(os.path.join(settings.STATIC_ROOT, "../source/shellac/tests/assets/song.mp3"))

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
        clip1.categories = [c1]
        clip1.tags.add("red", "green")

        clip2 = Clip.objects.create_clip("clip2", users[1])
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


    def test_for_serializing_clips(self):
        import json
        users = get_users()
        c1 = Category.objects.create_category("cat1", "described cat1")
        clip = Clip.objects.create_clip("clip1", users[0])
        clip.brand.name = brand_path
        clip.audio_file.name = audio_path

        c2 = Category.objects.create_category("cat2", "described cat2")
        clip2 = Clip.objects.create_clip("clip2", users[1])
        clip2.brand.name = brand_path
        clip2.audio_file.name = audio_path

        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), 2)

        data = json.loads(clip.serialize())
        expected = {"model": "shellac.clip", "fields": {"categories": [], "slug": "clip1",
                                                        "created": "2014-08-28T19:54:25.622",
                                                        "plays": 0,
                                                        "brand": "/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/tests/assets/seventyEight.png", "author": 1, "audio_file": "/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/tests/assets/song.mp3",
                                                        "title": "clip1",
                                                        "status": 1,
                                                        "rating": 0,
                                                        "description": ""},
                                                "pk": 1}
        self.assertEqual(data["model"], expected["model"])
        self.assertEqual(data["pk"], expected["pk"])
        self.assertEqual(data["fields"]["categories"], expected["fields"]["categories"])
        self.assertEqual(data["fields"]["plays"], expected["fields"]["plays"])
        self.assertEqual(data["fields"]["brand"], expected["fields"]["brand"])
        self.assertEqual(data["fields"]["title"], expected["fields"]["title"])
        self.assertEqual(data["fields"]["status"], expected["fields"]["status"])
        self.assertEqual(data["fields"]["rating"], expected["fields"]["rating"])
        self.assertEqual(data["fields"]["description"], expected["fields"]["description"])
        cleanClips()



