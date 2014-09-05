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

audio_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../assets/song.mp3")
brand_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../assets/seventyEight.png")

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

c1 = {"title": "cat1 title", "slug": "cat1-title", "description": "cat1 description"}
c2 = {'title': 'cat2 title', 'description': 'cat2 description'}

class Api_CategoryDetail(TestCase):
    def test_Category_serialization(self):
        cat1 = Category.objects.create_category(title=c1['title'], description=c1['description'])
        ##python native data types
        python_serialized = CategorySerializer(cat1)
        self.assertEqual(c1['title'].upper(), python_serialized.data['title'])
        self.assertEqual(c1['description'], python_serialized.data['description'])
        self.assertEqual(c1['slug'], python_serialized.data['slug'])
        ##JSON data
        # print(type(python_serialized.data)) ###class rest.serializers...
        json_serialized = JSONRenderer().render(python_serialized.data)
        # print(type(json_serialized) ### bytes
        self.assertEqual('{"id": 1, "title": "CAT1 TITLE", "slug": "cat1-title", "description": "cat1 description", "clips": []}',
        json_serialized.decode())

    def test_Category_deserialization(self):
        cat1 = Category.objects.create_category(title=c1['title'], description=c1['description'])
        python_serialized = CategorySerializer(cat1)
        json_serialized = JSONRenderer().render(python_serialized.data)

        ## make sure we have bytes
        byte_stream = BytesIO(json_serialized)
        # python native type conversion
        json_deserialized = JSONParser().parse(byte_stream)

        ##CASE I restore a previously created Category -- update the title
        json_deserialized['title'] = 'CAT1 NEW TITLE'
        # print("json_deserialized %s" % json_deserialized)
        deserialized = CategorySerializer(cat1, data=json_deserialized)
        self.assertTrue(deserialized.is_valid(), True)
        self.assertTrue(type(deserialized.object), 'object')
        self.assertTrue(deserialized.object.title, 'CAT1 NEW TITLE')
        self.assertTrue(deserialized.object.description, c1['description'])

        ##CASE II create a new Category item  --  delete the Clips array in this case

        # print("c2 %s" % c2)
        deserialized2 = CategorySerializer(data=c2)
        # deserialized2.save()
        self.assertTrue(deserialized2.is_valid(), True)
        # print(deserialized2.object.save())
        self.assertTrue(type(deserialized2.object), 'object')
        self.assertTrue(deserialized2.object.title, c2['title'])
        self.assertTrue(deserialized2.object.description, c2['description'])
        # print("deserialized2 clip set %s" % deserialized2.object.clip_set())

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
        # setFileAttributefromLocal(clip.audio_file, audio_path, "")

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


    ## NB: the Clip audio_field must be set to blank=True for these tests to be valid
    def test_Clip_deserialization(self):
        from rest_framework.compat import BytesIO

        users = get_users()
        cat1 = Category.objects.create_category(title='cat1 title', description='cat1 description')
        cat2 = Category.objects.create_category(title='cat2 title', description='cat2 description')
        cat3 = Category.objects.create_category(title='cat3 title', description='cat3 description')
        clip = Clip.objects.create_clip(title='clip1 title', author=users[0])

        clip.description = "clip1 description"
        clip.categories.add(cat1, cat2)
        setFileAttributefromLocal(clip.audio_file, audio_path, "song.mp3")
        self.assertTrue(Clip.objects.all().count(), 1)
        # print(clip.getCategoriesPretty())

        #serialize...
        python_serialized = ClipSerializer(clip)
        json_serialized = JSONRenderer().render(python_serialized.data)

        #deserialize...
        byte_stream = BytesIO(json_serialized)
        json_deserialized = JSONParser().parse(byte_stream)

        ### Case I: Update an existing Clip object
        json_deserialized['title'] = 'new clip title'
        json_deserialized['categories'].append('cat3-title')
        # print("json_deserialized %s:" % json_deserialized)
        deserialized = ClipSerializer(clip, data=json_deserialized)

        # if deserialized.is_valid():
        #     deserialized.save()
        # else:
        #     print(deserialized.errors)
        #
        # self.assertEqual(deserialized.is_valid(), True)
        # self.assertEqual(deserialized.object.title, 'new clip title')
        # self.assertEqual(deserialized.object.slug, "new-clip-title")
        # self.assertEqual(len(deserialized.object.getCategoriesPretty()), 3)
        # # print(deserialized.object.getCategoriesPretty())
        #
        # ### Case II: Create a completely new Clip
        # attributes = {'title': 'brand new title', 'author': users[1].id, 'description': 'b new desc'}
        # deserialized2 = ClipSerializer(data=attributes)
        # if deserialized2.is_valid():
        #     deserialized2.save()
        # else:
        #     print(deserialized2.errors)
        #
        # self.assertEqual(deserialized2.is_valid(), True)
        # self.assertEqual(deserialized2.object.title, 'brand new title')
        # self.assertEqual(deserialized2.object.author.username, "jvwong")
        # self.assertEqual(deserialized2.object.slug, "brand-new-title")
        # self.assertEqual(deserialized2.object.description, 'b new desc')
        # self.assertEqual(len(deserialized2.object.getCategoriesPretty()), 0)

        cleanClips()