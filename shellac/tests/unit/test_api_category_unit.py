import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User

from shellac.models import Category


### API root (/api/)
class Api_Root(APITestCase):

    def test_api_root_url_resolves_to_api_root_view(self):
        url = reverse('api_root')
        self.assertEqual(url, '/api/')

    def test_api_root_get_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

        response = self.client.get('/api/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('/api/users/', response.data['users'])
        self.assertIn('/api/categories/', response.data['categories'])
        self.assertIn('/api/clips/', response.data['clips'])
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


### API categories(/api/categories/)
class CategoryViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # line up view for '/'
    def test_CategoryViewSet_url_resolves_to_correct_view(self):
        url = reverse('category-list')
        self.assertEqual(url, '/api/categories/')

    def test_CategoryViewSet_GET_returns_correct_response(self):
        response = self.client.get('/api/categories/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # print(response.content.decode())
        self.assertIn('"id": 1', response.content.decode())
        self.assertIn('"title": "ARTS"', response.content.decode())
        self.assertIn('"description": "arts"', response.content.decode())
        self.assertIn('"clips": []', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_CategoryViewSet_POST_creates_and_returns_correct_response(self):
        payload = {"title": "cat1", "description": "cat1 description"}
        response = self.client.post("/api/categories/", payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(response.data['title'], "CAT1")
        self.assertEqual(response.data['description'], "cat1 description")
        self.assertEqual(response.data['clips'], [])


    def test_CategoryViewSet_POST_with_token_auth_creates_and_returns_correct_response(self):

        #make some users
        user = User.objects.create_user('andrea', email='aray@outlook.com', password='a')

        #get the corrent token
        Token.objects.create(user=user)
        payload1 = json.dumps({'username': 'andrea', 'password': 'a'})
        response1 = self.client.post("/api-token-auth/", payload1, content_type='application/json')
        token = response1.data['token']
        #print(token)

        payload = {"title": "cat1", "description": "cat1 description"}

        response = self.client.post("/api/categories/", payload, HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data =response.data
        #print(data)

        self.assertEqual(response.data['title'], "CAT1")
        self.assertEqual(response.data['description'], "cat1 description")
        self.assertEqual(response.data['clips'], [])

    def test_CategoryViewSet_GET_paginate_returns_correct_number_of_records(self):

        n = 1

        response = self.client.get('/api/categories/.json?page_size=' + str(n))
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data['results']
        #print(results)
        self.assertEqual(len(results), n)


class CategoryDetail(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)


    # line up view for '/'
    def test_Api_CategoryDetail_url_resolves_to_api_categorylist_view(self):
        url = reverse('category-detail', kwargs={'slug': 'arts'})
        self.assertEqual(url, '/api/categories/arts/')

    def test_Api_CategoryDetail_GET_returns_correct_response(self):
        response = self.client.get('/api/categories/arts/')
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"id": 1', response.content.decode())
        self.assertIn('"title": "ARTS"', response.content.decode())
        self.assertIn('"description": "arts"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_Api_CategoryDetail_PUT_updates_existing_object(self):
        payload = {"title": "ARTS", "description": "arts"}
        response = self.client.put("/api/categories/arts/", payload)

        #A 200 indicated modified resource
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        #the response to match with our original payload
        self.assertIn(response.data['description'], payload['description'])

        #PUT a new object will create: HTTP_201_CREATED
        payload_create = {"title": "cat1 new title", "description": "cat1 description"}
        response = self.client.put("/api/categories/cat1-new-title/", payload_create, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_Api_CategoryDetail_DELETE_removes_existing_object(self):
        payload = {"title": "ARTS", "description": "arts"}
        response = self.client.delete("/api/categories/arts/")

        #A 204 indicated modified resource
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        #A get response to NOT match
        get_response = self.client.get("/api/categories/")
        # print(get_response.data)
        self.assertNotIn("arts", get_response.data)