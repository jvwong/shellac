from django.core.urlresolvers import resolve
from rest_framework.test import APITestCase
from shellac.models import Category
from shellac.views.api import CategoryList, CategoryDetail
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
        self.assertEqual(response.status_code, status.HTTP_200_OK)

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


class ApiPageTest_slug(APITestCase):

    # line up view for '/'
    def test_api_slug_category_url_resolves_to_api_category_view(self):
        url = reverse('shellac_api_category_detail', kwargs={'slug': 'arts'})
        self.assertEqual(url, '/api/category/arts/')

    def test_api_slug_get_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/arts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "ARTS", "description": "arts"}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_api_slug_put_updates_existing_object(self):
        Category.objects.autopopulate()

        payload = {"title": "ARTS", "description": "arts"}
        response = self.client.put("/api/category/arts/", payload)
        #A 200 indicated modified resource
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        #the response to match with our original payload
        self.assertIn(response.data['description'], payload['description'])

        #PUT a new object will NOT create: HTTP_404_NOT_FOUND
        payload_create = {"title": "cat1 new title", "description": "cat1 description"}
        response = self.client.put("/api/category/cat1-new-title/", payload_create, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    def test_api_slug_delete_removes_existing_object(self):
        Category.objects.autopopulate()

        payload = {"title": "ARTS", "description": "arts"}
        response = self.client.delete("/api/category/arts/")

        #A 204 indicated modified resource
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        #A get response to NOT match
        get_response = self.client.get("/api/category/")
        self.assertNotIn(get_response.data[0]['description'], "arts")
