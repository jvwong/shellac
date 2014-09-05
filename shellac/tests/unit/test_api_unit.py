from rest_framework.test import APITestCase
from shellac.models import Category, Clip
from django.core.urlresolvers import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
User = get_user_model()
from shellac.tests.utils.base import setFileAttributefromLocal, cleanClips

"""
 BEGIN CATEGORY API
"""
class Api_CategoryList(APITestCase):

    # line up view for '/'
    def test_api_root_category_url_resolves_to_api_categorylist_view(self):
        url = reverse('shellac_api_category')
        self.assertEqual(url, '/api/category/')

    def test_api_root_get_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "ARTS", "slug": "arts", "description": "arts", "clips": []}', response.content.decode())
        self.assertIn('{"id": 2, "title": "BUSINESS", "slug": "business", "description": "business", "clips": []}', response.content.decode())
        self.assertIn('{"id": 3, "title": "FOOD", "slug": "food", "description": "food", "clips": []}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_api_root_post_creates_and_returns_correct_response(self):
        # Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')
        payload = {"title": "cat1", "description": "cat1 description"}
        response = self.client.post("/api/category/", payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #gotta massage the reponse to match with our original payload
        self.assertEqual(response.data, {"id": 1, "title": "CAT1", "slug": "cat1", "description": "cat1 description", "clips": []})


class Api_CategoryDetail(APITestCase):

    # line up view for '/'
    def test_Api_CategoryDetail_url_resolves_to_api_categorylist_view(self):
        url = reverse('shellac_api_category_detail', kwargs={'slug': 'arts'})
        self.assertEqual(url, '/api/category/arts/')

    def test_Api_CategoryDetail_GET_returns_correct_response(self):
        Category.objects.autopopulate()

        response = self.client.get('/api/category/arts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('{"id": 1, "title": "ARTS", "slug": "arts", "description": "arts", "clips": []}', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_Api_CategoryDetail_PUT_updates_existing_object(self):
        Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

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


    def test_Api_CategoryDetail_DELETE_removes_existing_object(self):
        Category.objects.autopopulate()
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')

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
import os
import json
from django.conf import settings
audio_path = os.path.join(settings.STATIC_ROOT, "../source/shellac/tests/assets/song.mp3")

class Api_ClipList(APITestCase):

    def test_ClipList_url_resolves_to_api_ClipList_view(self):
        url = reverse('shellac_api_clip')
        self.assertEqual(url, '/api/clip/')

    def test_ClipList_GET_returns_correct_response(self):
        ##authenticate REST style
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        #create the clips
        clip1 = Clip.objects.create(title='clip1 title', author=user1)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")

        response = self.client.get('/api/clip/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        # print(resp[0])
        self.assertEqual(resp[0].get('id'), clip1.id)
        self.assertEqual(resp[0].get('title'), clip1.title)
        self.assertEqual(resp[0].get('author'), clip1.author.id)
        self.assertEqual(resp[0].get('description'), clip1.description)
        self.assertEqual(resp[0].get('plays'), clip1.plays)
        self.assertEqual(resp[0].get('status'), clip1.status)
        self.assertEqual(resp[0].get('rating'), clip1.rating)
        self.assertEqual(resp[0].get('audio_file'), clip1.audio_file.name)

        cleanClips()


    def test_ClipList_POST_creates_and_returns_correct_response(self):

        #make some users
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 0)

        # open a file and attach it to the request payload
        f = open(audio_path, "rb")
        payload = {"title": "clip1 title", "author": user1.id, "description": "clip1 description", "audio_file": f}
        # payload = {"title": "clip1 title", "author": user1.id, "description": "clip1 description"}

        # response should be 'HTTP_201_CREATED' and have a clip count of 1
        self.client.login(username='andrea', password='a')
        response = self.client.post("/api/clip/", payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data =response.data
        self.assertEqual(data['title'], 'clip1 title')
        self.assertEqual(data['description'], 'clip1 description')
        self.assertIn('sounds', data['audio_file'])
        self.assertEqual(data['plays'], 0)
        self.assertEqual(data['rating'], 0)
        self.assertEqual(data['status'], 1)
        self.assertEqual(data['brand'], '')
        self.assertEqual(data['categories'], [])
        self.assertEqual(data['owner'], 'andrea')

        cleanClips()

class Api_ClipDetail(APITestCase):

    # line up view for '/'
    def test_api_ClipDetail_url_resolves_to_api_ClipDetail_view(self):
        url = reverse('shellac_api_clip_detail', kwargs={'pk': 1})
        self.assertEqual(url, '/api/clip/1/')

    def test_api_ClipDetail_GET_returns_correct_response(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        response = self.client.get('/api/clip/1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = response.data
        # print(resp)
        self.assertEqual('clip1 title', resp['title'])
        self.assertEqual('clip1-title', resp['slug'])
        self.assertEqual('clip1 description', resp['description'])
        self.assertIn('sounds/', resp['audio_file'])
        self.assertEqual(resp['plays'], 0)
        self.assertEqual(resp['rating'], 0)
        self.assertEqual(resp['status'], 1)
        self.assertEqual(resp['brand'], '')
        self.assertEqual(resp['categories'], [])
        self.assertEqual(resp['owner'], 'andrea')
        self.assertEqual([], resp['categories'])
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

        cleanClips()

    def test_ClipDetail_PUT_updates_existing_object(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        clip1 = Clip.objects.create(title='clip1 title', author=user1)
        clip1.description = "clip1 description"
        # setFileAttributefromLocal(clip1.audio_file, audio_path, "song.mp3")
        self.assertEqual(User.objects.all().count(), 1)
        self.assertEqual(Clip.objects.all().count(), 1)

        # open a file and attach it to the request payload
        f = open(audio_path, "rb")

        self.client.login(username='andrea', password='a')
        response = self.client.put('/api/clip/1/', data={'title': 'updated clip1 title',
                                                         'author': user1.id,
                                                         'description': 'updated clip1 description',
                                                         'audio_file': f})

        resp = response.data
        # print(resp)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['title'], 'updated clip1 title')
        self.assertEqual(resp['slug'], 'updated-clip1-title')
        self.assertEqual(resp['description'], 'updated clip1 description')
        self.assertEqual(resp['author'], 1)
        self.assertEqual(resp['owner'], 'andrea')
        self.assertEqual(resp['plays'], 0)
        self.assertEqual(resp['status'], 1)
        self.assertEqual(resp['owner'], 'andrea')

        cleanClips()


    def test_ClipDetail_DELETE_removes_existing_object(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        #A 204 indicated modified resource
        self.client.login(username='andrea', password='a')
        response = self.client.delete('/api/clip/1/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # A get response to NOT match
        self.assertEqual(Clip.objects.all().count(), 1)
        r = self.client.get("/api/category/1/")
        self.assertEqual(r.status_code, 404)

        cleanClips()
