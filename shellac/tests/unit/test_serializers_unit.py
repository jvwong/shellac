from django.test import TestCase
from shellac.models import Category, Clip
from shellac.serializers import CategorySerializer, ClipSerializer, UserSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
import json
from django.contrib.auth import get_user_model
User = get_user_model()
import os
from django.conf import settings
from shellac.tests.utils.base import setFileAttributefromLocal, cleanClips
from rest_framework.compat import BytesIO
from django.template.defaultfilters import slugify
import datetime

c1 = {"title": "cat1 title",  "slug": "cat1-title", "description": "cat1 description"}
c1_json = json.dumps(c1)

class CategorySerializerTest(TestCase):

    def test_Category_serialization(self):
        cat1 = Category.objects.create_category(title=c1['title'],
                                                description=c1['description'])

        ##python native data types
        python_serialized = CategorySerializer(cat1)
        self.assertEqual(c1['title'].upper(), python_serialized.data['title'])
        self.assertEqual(c1['description'], python_serialized.data['description'])
        self.assertEqual(c1['slug'], python_serialized.data['slug'])

        ##JSON data
        json_serialized = JSONRenderer().render(python_serialized.data)
        self.assertEqual(b'{"id": 1, "title": "CAT1 TITLE", "slug": "cat1-title", "description": "cat1 description"}',
                         json_serialized)


    def test_Category_deserialization(self):
        cat1 = Category.objects.create_category(title=c1['title'],
                                                description=c1['description'])
        python_serialized = CategorySerializer(cat1)
        json_serialized = JSONRenderer().render(python_serialized.data)

        byte_stream = BytesIO(json_serialized)
        json_deserialized = JSONParser().parse(byte_stream)

        deserialized = CategorySerializer(data=json_deserialized)

        self.assertTrue(deserialized.is_valid(), True)
        self.assertTrue(type(deserialized.object), 'object')
        self.assertTrue(deserialized.object.title, c1['title'])
        self.assertTrue(deserialized.object.description, c1['description'])



brand_path = os.path.abspath(os.path.join(settings.STATIC_ROOT, "../source/shellac/tests/assets/seventyEight.png"))
audio_path = os.path.abspath(os.path.join(settings.STATIC_ROOT, "../source/shellac/tests/assets/song.mp3"))

def get_users():
    username1_dummy = 'andrea'
    password1_dummy = 'a'
    email1_dummy = 'aray@outlook.com'

    username2_dummy = 'jvwong'
    password2_dummy = 'j'
    email2_dummy = 'jray@outlook.com'

    user1 = User.objects.create_user(username1_dummy, email=email1_dummy, password=password1_dummy)
    user2 = User.objects.create_user(username2_dummy, email=email2_dummy, password=password2_dummy)

    users = [user1, user2]
    return users


class UserSerializerTest(TestCase):
    def test_User_serialization(self):
        users = get_users()
        python_serialized = UserSerializer(users, many=True)

        #user 1
        self.assertEqual(users[0].id, python_serialized.data[0]['id'])
        self.assertEqual(users[0].username, python_serialized.data[0]['username'])
        self.assertEqual(users[0].email, python_serialized.data[0]['email'])

        #user 2
        self.assertEqual(users[1].id, python_serialized.data[1]['id'])
        self.assertEqual(users[1].username, python_serialized.data[1]['username'])
        self.assertEqual(users[1].email, python_serialized.data[1]['email'])




class ClipSerializerTest(TestCase):

    def test_Clip_serialization(self):
        users = get_users()
        clip = Clip.objects.create(title='clip1 title', author=users[0])
        clip.description = "clip1 description"
        setFileAttributefromLocal(clip.audio_file, audio_path, "")
        # print(clip.audio_file.name)

        ##python native data types
        python_serialized = ClipSerializer(clip)
        # print(python_serialized)

        self.assertEqual(clip.id, python_serialized.data['id'])
        self.assertEqual(clip.title, python_serialized.data['title'])
        self.assertEqual(clip.description, python_serialized.data['description'])
        self.assertEqual(clip.slug, python_serialized.data['slug'])
        self.assertEqual(clip.plays, python_serialized.data['plays'])
        self.assertEqual(clip.rating, python_serialized.data['rating'])
        self.assertEqual(clip.status, python_serialized.data['status'])
        self.assertEqual(clip.created, python_serialized.data['created'])

        ##JSON data
        json_serialized = JSONRenderer().render(python_serialized.data)
        # print(json_serialized)

        json_serialized_dict = json.loads(json_serialized.decode())
        self.assertEqual(clip.id, json_serialized_dict.get('id'))
        self.assertEqual(clip.title, json_serialized_dict.get('title'))
        self.assertEqual(clip.description, json_serialized_dict.get('description'))
        self.assertEqual(clip.slug, json_serialized_dict.get('slug'))
        self.assertEqual(clip.plays, json_serialized_dict.get('plays'))
        self.assertEqual(clip.rating, json_serialized_dict.get('rating'))
        self.assertEqual(clip.status, json_serialized_dict.get('status'))
        self.assertIn(clip.created.strftime('%Y-%m-%dT%H:%M:%S'), json_serialized_dict.get('created'))

        cleanClips()

    # def test_Clip_deserialization(self):
    #     from rest_framework.compat import BytesIO
    #
    #     users = get_users()
    #     clip = Clip.objects.create(title='clip1 title', author=users[0])
    #     clip.description = "clip1 description"
    #     setFileAttributefromLocal(clip.audio_file, audio_path, "")
    #     self.assertTrue(Clip.objects.all().count(), 1)
    #
    #     #serialize...
    #     python_serialized = ClipSerializer(clip)
    #     json_serialized = JSONRenderer().render(python_serialized.data)
    #
    #     #deserialize...
    #     byte_stream = BytesIO(json_serialized)
    #     #NB: FileField and ImageField must use FileUploadParser
    #     json_deserialized = JSONParser().parse(byte_stream)
    #     deserialized = ClipSerializer(data=json_deserialized)
    #
    #     deserialized.is_valid()
    #     print(deserialized.is_valid())
    #
    #     # self.assertTrue(deserialized.is_valid(), True)
    #     # self.assertTrue(type(deserialized.object), 'object')
    #     # self.assertTrue(deserialized.object.title, 'clip1 title')
    #     # self.assertTrue(deserialized.object.description, "clip1 description")
    #
    #     cleanClips()



