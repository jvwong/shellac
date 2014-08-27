from django.test import TestCase
from shellac.models import Clip, Category
from django.contrib.auth.models import User
from django.conf import settings
from shellac.tests.utils.base import cleanClips, setFileAttributefromLocal

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
        clip1 = Clip.objects.create_clip(title="clip1", author=users[0])
        clip1.categories = [c1]
        clip1.tags.add("red", "green")

        clip2 = Clip.objects.create_clip(title="clip2", author=users[1])
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

        img_url = settings.STATIC_ROOT + "/shellac/assets/seventyEight.png"
        local = settings.STATIC_ROOT + "/shellac/assets/song.mp3"
        c1 = Category.objects.create_category("cat1", "described cat1")
        c2 = Category.objects.create_category("cat2", "described cat2")

        users = get_users()
        clip = Clip.objects.create_clip(title="clip1", author=users[0])
        clip.categories = [c1]
        clip2 = Clip.objects.create_clip(title="clip2", author=users[1])
        clip.categories = [c2]

        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), 2)

        jsonclip = clip.toJSON()
        jsonclip2 = clip2.toJSON()

        self.assertJSONEqual(jsonclip, json.dumps({"title": saved_clips[0].title,
                                                   "author": saved_clips[0].author.username,
                                                   "brand": saved_clips[0].brand.url,
                                                   "audio_file": saved_clips[0].audio_file.url,
                                                   "categories": saved_clips[0].getCategoriesPretty(),
                                                   "description": saved_clips[0].description,
                                                   "plays": saved_clips[0].plays,
                                                   "rating": saved_clips[0].rating,
                                                   "status": "PUBLIC",
                                                   "created": "Aug 27 2014"}))

        self.assertJSONEqual(jsonclip2, json.dumps({"title": saved_clips[1].title,
                                                   "author": saved_clips[1].author.username,
                                                   "brand": saved_clips[1].brand.url,
                                                   "audio_file": saved_clips[1].audio_file.url,
                                                   "categories": saved_clips[1].getCategoriesPretty(),
                                                   "description": saved_clips[1].description,
                                                   "plays": saved_clips[1].plays,
                                                   "rating": saved_clips[1].rating,
                                                   "status": "PUBLIC",
                                                   "created": "Aug 27 2014"}))

        cleanClips()


