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
class Api_Category_Root(APITestCase):

    # line up view for '/'
    def test_api_root_category_url_resolves_to_api_categorylist_view(self):
        url = reverse('category-list')
        self.assertEqual(url, '/api/categories/')

    def test_CategoryList_GET_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

        Category.objects.autopopulate()

        response = self.client.get('/api/categories/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # print(response.content.decode())
        self.assertIn('"id": 1', response.content.decode())
        self.assertIn('"title": "ARTS"', response.content.decode())
        self.assertIn('"description": "arts"', response.content.decode())
        self.assertIn('"clips": []', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_CategoryList_POST_creates_and_returns_correct_response(self):
        # Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')
        payload = {"title": "cat1", "description": "cat1 description"}
        response = self.client.post("/api/categories/", payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #gotta massage the reponse to match with our original payload
        # print(response.data)
        # print(response.data['id'])

        self.assertEqual(response.data['title'], "CAT1")
        self.assertEqual(response.data['description'], "cat1 description")
        self.assertEqual(response.data['clips'], [])


    def test_CategoryList_POST_with_token_auth_creates_and_returns_correct_response(self):

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




class CategoryDetail(APITestCase):

    # line up view for '/'
    def test_Api_CategoryDetail_url_resolves_to_api_categorylist_view(self):
        url = reverse('category-detail', kwargs={'slug': 'arts'})
        self.assertEqual(url, '/api/categories/arts/')

    def test_Api_CategoryDetail_GET_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')
        Category.objects.autopopulate()

        response = self.client.get('/api/categories/arts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"id": 1', response.content.decode())
        self.assertIn('"title": "ARTS"', response.content.decode())
        self.assertIn('"description": "arts"', response.content.decode())
        self.assertIn('"clips": []', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_Api_CategoryDetail_PUT_updates_existing_object(self):
        Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

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
        Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

        payload = {"title": "ARTS", "description": "arts"}
        response = self.client.delete("/api/categories/arts/")

        #A 204 indicated modified resource
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        #A get response to NOT match
        get_response = self.client.get("/api/categories/")
        # print(get_response.data)
        self.assertNotIn("arts", get_response.data)