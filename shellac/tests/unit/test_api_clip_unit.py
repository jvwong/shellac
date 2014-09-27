import os
import json

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.db.models import Q

from shellac.models import Clip
from shellac.tests.utils.unit import setFileAttributefromLocal, cleanClips

audio_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../assets/song.mp3")

class ClipListViewSet(APITestCase):

    def test_ClipListViewSet_resolves_to_correct_view(self):
        url = reverse('clip-list')
        self.assertEqual(url, '/api/clips/')

    def test_ClipListViewSet_GET_authenticated_returns_correct_response(self):
        ##authenticate REST style
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        #create the clips
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")

        # print(Clip.objects.all().count())

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/clips/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        # print(resp['results'][0])
        self.assertEqual(resp['results'][0].get('id'), clip1.id)
        self.assertEqual(resp['results'][0].get('title'), clip1.title)
        self.assertIn(clip1.author.user.username, resp['results'][0].get('author'))
        self.assertEqual(resp['results'][0].get('description'), clip1.description)
        self.assertEqual(resp['results'][0].get('plays'), clip1.plays)
        self.assertEqual(resp['results'][0].get('status'), clip1.status)
        self.assertEqual(resp['results'][0].get('rating'), clip1.rating)
        self.assertEqual(resp['results'][0].get('audio_file'), clip1.audio_file.name)

        cleanClips()

    def test_ClipListViewSet_GET_unauthenticated_returns_correct_response(self):
        ##authenticate REST style
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        #create the clips
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")

        # print(Clip.objects.all().count())
        response = self.client.get('/api/clips/.json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        cleanClips()


    def test_ClipListViewSet_POST_creates_and_returns_correct_response(self):

        #make some users
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 0)

        # open a file and attach it to the request payload
        f = open(audio_path, "rb")
        # payload = {"title": "clip1 title", "description": "clip1 description", "audio_file": f}
        payload = {"title": "clip1 title", "author": "http://testserver/api/people/andrea/", "description": "clip1 description", "audio_file": f}

        # response should be 'HTTP_201_CREATED' and have a clip count of 1
        self.client.login(username='andrea', password='a')
        response = self.client.post("/api/clips/", payload)
        data =response.data
        #print(data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(data['title'], 'clip1 title')
        self.assertEqual(data['description'], 'clip1 description')
        self.assertIn('sounds', data['audio_file'])
        self.assertEqual(data['plays'], 0)
        self.assertEqual(data['rating'], 0)
        self.assertEqual(data['status'], 1)
        self.assertEqual(data['brand'], '')
        self.assertEqual(data['categories'], [])
        #self.assertEqual(data['author']['user']['username'], 'andrea')

        cleanClips()


    def test_ClipListViewSet_POST_returns_corrent_authorization_token(self):

        #make some users
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 0)

        #Get the token directly from the DB
        token = Token.objects.get_or_create(user=user1) ##returns (Token, boolean) tuple
        #print(token[0].key)

        payload = json.dumps({'username': 'andrea', 'password': 'a'})
        #print(payload)
        response = self.client.post("/api-token-auth/", payload, content_type='application/json')
        data =response.data
        #print(data)

        self.assertEqual(token[0].key, data['token'])


    def test_ClipListViewSet_POST_with_token_auth_creates_and_returns_correct_response(self):

        #make some users
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 0)

        #get the corrent token
        Token.objects.create(user=user1)
        payload1 = json.dumps({'username': 'andrea', 'password': 'a'})
        #print(payload1)
        response1 = self.client.post("/api-token-auth/", payload1, content_type='application/json')
        token = response1.data['token']
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        ### open a file and attach it to the request payload
        ### this is bizarre behaviour as the author is automatically set upon save
        ### and so ignores the author field even though it is required
        f = open(audio_path, "rb")
        payload = {'title': 'clip1 title', 'author': 'http://testserver/api/people/andrea/', 'description': 'clip1 description', 'audio_file': f}

        ### response should be 'HTTP_201_CREATED' and have a clip count of 1
        response = self.client.post("/api/clips/", payload, HTTP_AUTHORIZATION='Token ' + token)
        #self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data =response.data
        #print(data)
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

    def test_ClipListViewSet_GET_paginate_returns_correct_number_of_records(self):
        ##authenticate REST style
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        #create the clips
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")

        n = 1

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/.json?page_size=' + str(n))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data['results']
        #print(results)
        self.assertEqual(len(results), n)


class ClipDetailViewSet(APITestCase):

    # line up view for '/'
    def test_api_ClipDetailViewSet_GET_resolves_to_correct_view(self):
        url = reverse('clip-detail', kwargs={'pk': 1})
        self.assertEqual(url, '/api/clips/1/')

    def test_api_ClipDetailViewSet_GET_own_returns_correct_response(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/clips/1/')
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

    def test_api_ClipDetailViewSet_GET_others_returns_correct_response(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        self.client.login(username='jvwong', password='j')
        response = self.client.get('/api/clips/1/')
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

    def test_ClipDetailViewSet_PUT_own_updates_existing_object(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        # setFileAttributefromLocal(clip1.audio_file, audio_path, "song.mp3")
        self.assertEqual(User.objects.all().count(), 1)
        self.assertEqual(Clip.objects.all().count(), 1)

        # open a file and attach it to the request payload
        f = open(audio_path, "rb")

        self.client.login(username='andrea', password='a')
        response = self.client.put('/api/clips/1/', data={'title': 'updated clip1 title',
                                                         'author': 'http://testserver/api/people/andrea/',
                                                         'description': 'updated clip1 description',
                                                         'audio_file': f})

        resp = response.data
        #print(resp)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['title'], 'updated clip1 title')
        self.assertEqual(resp['slug'], 'updated-clip1-title')
        self.assertEqual(resp['description'], 'updated clip1 description')
        self.assertIn('andrea', resp['author'])
        self.assertEqual(resp['owner'], 'andrea')
        self.assertEqual(resp['plays'], 0)
        self.assertEqual(resp['status'], 1)
        self.assertEqual(resp['owner'], 'andrea')

        cleanClips()

    def test_ClipDetail_PUT_by_nonowner_is_rejected(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"

        # setFileAttributefromLocal(clip1.audio_file, audio_path, "song.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 1)

        # open a file and attach it to the request payload
        f = open(audio_path, "rb")

        self.client.login(username='jvwong', password='j')
        response = self.client.put('/api/clips/1/', data={'title': 'updated clip1 title',
                                                         'author': 'http://testserver/api/users/andrea/',
                                                         'description': 'updated clip1 description',
                                                         'audio_file': f})

        resp = response.data
        #print(resp)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        cleanClips()


    def test_ClipDetail_DELETE_removes_existing_object(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")
        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")
        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        #A 204 indicated modified resource
        self.client.login(username='andrea', password='a')
        response = self.client.delete('/api/clips/1/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # A get response to NOT match
        self.assertEqual(Clip.objects.all().count(), 1)
        r = self.client.get("/api/categories/1/")
        self.assertEqual(r.status_code, 404)

        cleanClips()

    def test_ClipDetail_DELETE_by_nonowner_is_rejected(self):
        #add users and clips
        user1 = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        user2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        clip1 = Clip.objects.create(title='clip1 title', author=user1.person)
        clip1.description = "clip1 description"
        setFileAttributefromLocal(clip1.audio_file, audio_path, "song1.mp3")

        clip2 = Clip.objects.create(title='clip2 title', author=user2.person)
        clip2.description = "clip2 description"
        setFileAttributefromLocal(clip2.audio_file, audio_path, "song2.mp3")

        self.assertEqual(User.objects.all().count(), 2)
        self.assertEqual(Clip.objects.all().count(), 2)

        #A 403 Forbidden indicates non-owner attempts to alter resource
        self.client.login(username='jvwong', password='j')
        response = self.client.delete('/api/clips/1/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        cleanClips()



class ClipListFollowingView(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # view for '/api/clips/following/(?P<username>[\w.@+-]+)/$'
    def test_ClipListFollowingView_resolves_to_correct_view(self):
        qstatus = 'following'
        qusername = 'jvwong'
        qurl = '/api/clips/' + qstatus + '/' + qusername + '/'

        url = reverse('clip-list-following', kwargs={'username': qusername, 'status': qstatus})
        self.assertEqual(url, qurl)

    def test_ClipListFollowingView_GET_username_returns_correct_list(self):
        qstatus = 'following'
        qusername = 'jvwong'
        qurl = '/api/clips/' + qstatus + '/' + qusername + '/'

        response = self.client.get(qurl)
        #self.assertEqual(response.status_code, status.HTTP_200_OK)
        resp = json.loads(response.content.decode())
        #print(resp)

        # #jvwong is following everyone else
        qclips = Clip.objects.filter(Q(author__username='aray') |
                                     Q(author__username='jray') |
                                     Q(author__username='kray'))
        self.assertEqual(len(qclips), len(resp))
        self.assertContains(response, 'aray')
        self.assertContains(response, 'jray')
        self.assertContains(response, 'kray')