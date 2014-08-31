from django.core.urlresolvers import resolve
from rest_framework.test import APITestCase
from shellac.models import Category
from shellac.views.api import CategoryList
from django.core.urlresolvers import reverse
from rest_framework import status
import json


class ApiPageTest_root(APITestCase):

    # line up view for '/'
    def test_api_root_category_url_resolves_to_api_category_view(self):
        url = reverse('shellac_api_category')
        self.assertEqual(url, '/api/category/')

    def test_api_root_get_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/.json')
        self.assertEqual(response.status_code, 200)

        self.assertIn('{"id": 1, "title": "ARTS", "description": "arts"}', response.content.decode())
        self.assertIn('{"id": 2, "title": "BUSINESS", "description": "business"}', response.content.decode())
        self.assertIn('{"id": 3, "title": "FOOD", "description": "food"}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_api_root_post_creates_and_returns_correct_response(self):
        # Category.objects.autopopulate()
        payload = {"title": "cat1", "description": "cat1 description"}
        response = self.client.post("/api/category/", payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #gotta massage the reponse to match with our original payload
        self.assertEqual(response.data, {"id": 1, "title": "CAT1", "description": "cat1 description"})






