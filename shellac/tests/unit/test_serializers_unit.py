from django.test import TestCase
from shellac.models import Category, Clip
from shellac.serializers import CategorySerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
import json
from django.template.defaultfilters import slugify
c1 = {"title": "cat1 title",  "slug": "cat1-title", "description": "cat1 description"}
c1_json = json.dumps(c1)

class SerializerTest(TestCase):

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
        from rest_framework.compat import BytesIO

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





