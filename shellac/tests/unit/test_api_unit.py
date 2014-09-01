from rest_framework.test import APITestCase
from shellac.models import Category, Clip
from django.core.urlresolvers import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
User = get_user_model()
"""
 BEGIN CATEGORY API
"""
class Api_Category_PageTest_root(APITestCase):

    # line up view for '/'
    def test_api_root_category_url_resolves_to_api_categorylist_view(self):
        url = reverse('shellac_api_category')
        self.assertEqual(url, '/api/category/')

    def test_api_root_get_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "ARTS", "slug": "arts", "description": "arts"}', response.content.decode())
        self.assertIn('{"id": 2, "title": "BUSINESS", "slug": "business", "description": "business"}', response.content.decode())
        self.assertIn('{"id": 3, "title": "FOOD", "slug": "food", "description": "food"}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_api_root_post_creates_and_returns_correct_response(self):
        # Category.objects.autopopulate()
        payload = {"title": "cat1", "description": "cat1 description"}
        response = self.client.post("/api/category/", payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #gotta massage the reponse to match with our original payload
        self.assertEqual(response.data, {"id": 1, "title": "CAT1", "slug": "cat1", "description": "cat1 description"})


class Api_Category_PageTest_slug(APITestCase):

    # line up view for '/'
    def test_api_slug_category_url_resolves_to_api_categorylist_view(self):
        url = reverse('shellac_api_category_detail', kwargs={'slug': 'arts'})
        self.assertEqual(url, '/api/category/arts/')

    def test_api_slug_get_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/arts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "ARTS", "slug": "arts", "description": "arts"}', response.content.decode())
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

# """
#  BEGIN USER API
# """
class Api_User_PageTest_root(APITestCase):

    # line up view for '/'
    def test_api_root_user_url_resolves_to_api_category_view(self):
        url = reverse('shellac_api_user')
        self.assertEqual(url, '/api/user/')

    def test_api_root_user_get_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        response = self.client.get('/api/user/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "username": "andrea", "email": "aray@outlook.com", "clips": []}', response.content.decode())
        self.assertIn('{"id": 2, "username": "jvwong", "email": "jray@outlook.com", "clips": []}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


class Api_User_PageTest_username(APITestCase):

    # line up view for '/'
    def test_api_username_user_url_resolves_to_api_userlist_view(self):
        url = reverse('shellac_api_user_detail', kwargs={'username': 'jvwong'})
        self.assertEqual(url, '/api/user/jvwong/')

    def test_api_username_get_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        response = self.client.get('/api/user/jvwong/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 2, "username": "jvwong", "email": "jray@outlook.com", "clips": []}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')



# """
#  BEGIN CLIP API
# """
class Api_Clip_PageTest_root(APITestCase):

    # line up view for '/'
    def test_api_root_clip_url_resolves_to_api_cliplist_view(self):
        url = reverse('shellac_api_clip')
        self.assertEqual(url, '/api/clip/')

    def test_api_root_clip_get_returns_correct_response(self):

        ##authenticate REST style
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.client.login(username='andrea', password='a')

        #create the clips
        clip1 = Clip.objects.create(title='clip1 title', author=user1)
        clip1.description = "clip1 description"
        clip2 = Clip.objects.create(title='clip2 title', author=user2)
        clip2.description = "clip2 description"

        response = self.client.get('/api/clip/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "clip1 title", "author": "andrea", "description": "", "brand": "", "plays": 0, "rating": 0, "status": 1, "slug": "clip1-title", "created": ', response.content.decode())
        self.assertIn('{"id": 2, "title": "clip2 title", "author": "jvwong", "description": "", "brand": "", "plays": 0, "rating": 0, "status": 1, "slug": "clip2-title", "created": ', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


    # def test_api_root_clip_post_creates_and_returns_correct_response(self):
    #
    #     #authenticate REST style
    #     User.objects.create_user('andrea', email='aray@outlook.com', password='a')
    #     User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
    #     self.client.login(username='andrea', password='a')
    #     self.assertEqual(User.objects.all().count(), 2)
    #
    #     payload = {"title": "clip1 title", "author": "andrea", "description": "clip1 description"}
    #     response = self.client.post("/api/clip/", payload, format='json')
    #
    #     # print(response)
    #
    #     # self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #
    #     #gotta massage the response to match with our original payload
    #     # self.assertIn('{"id": 1, "title": "clip1 title", "description": "", "plays": 0, "rating": 0, "status": 1, "slug": "clip1-title", "created":', response.data)

#
# class Api_Clip_PageTest_slug(APITestCase):
#
#     # line up view for '/'
#     def test_api_slug_category_url_resolves_to_api_category_view(self):
#         url = reverse('shellac_api_category_detail', kwargs={'slug': 'arts'})
#         self.assertEqual(url, '/api/category/arts/')
#
#     def test_api_slug_get_returns_correct_response(self):
#         Category.objects.autopopulate()
#
#         response = self.client.get('/api/category/arts/')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#         self.assertIn('{"id": 1, "title": "ARTS", "slug": "arts", "description": "arts"}', response.content.decode())
#         self.assertEqual(response.__getitem__('Content-Type'), 'application/json')
#
#     def test_api_slug_put_updates_existing_object(self):
#         Category.objects.autopopulate()
#
#         payload = {"title": "ARTS", "description": "arts"}
#         response = self.client.put("/api/category/arts/", payload)
#         #A 200 indicated modified resource
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         #the response to match with our original payload
#         self.assertIn(response.data['description'], payload['description'])
#
#         #PUT a new object will NOT create: HTTP_404_NOT_FOUND
#         payload_create = {"title": "cat1 new title", "description": "cat1 description"}
#         response = self.client.put("/api/category/cat1-new-title/", payload_create, format='json')
#         self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
#
#
#     def test_api_slug_delete_removes_existing_object(self):
#         Category.objects.autopopulate()
#
#         payload = {"title": "ARTS", "description": "arts"}
#         response = self.client.delete("/api/category/arts/")
#
#         #A 204 indicated modified resource
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#
#         #A get response to NOT match
#         get_response = self.client.get("/api/category/")
#         self.assertNotIn(get_response.data[0]['description'], "arts")
