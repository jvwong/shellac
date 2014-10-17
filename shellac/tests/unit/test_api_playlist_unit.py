import json

from rest_framework import status
from rest_framework.test import APITestCase

from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import User

from shellac.models import Playlist, Person

class PlaylistListViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.saved_playlists = Playlist.objects.all()
        self.numPlaylists = Playlist.objects.all().count()

    def test_PlaylistListViewSet_reverses_to_correct_url(self):
        url = reverse('playlist-list')
        self.assertEqual(url, '/api/playlists/')

    def test_PlaylistListViewSet_resolves_to_correct_view(self):
        view = resolve('/api/playlists/')
        #I don't know how to extract the name of the Class
        self.assertEqual(type(view.func).__name__, 'function')

    def test_PlaylistListViewSet_GET_returns_correct_list(self):
        response = self.client.get('/api/playlists/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resp = json.loads(response.content.decode())
        results = resp['results']
        # print(results)

        #Returns the correct number of playlists
        self.assertEqual(len(results), self.numPlaylists)

        #Returns the correct playlists -- query ordering etc should be identical
        for p in range(self.numPlaylists):
            self.assertTrue(self.saved_playlists[p], results[p])


    def test_PlaylistListViewSet_POST_by_owner_accepted(self):
        payload = {
            "person": self.urlname,
            "title": "another playlist",
            "description": "another playlist description"
        }
        response = self.client.post('/api/playlists/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #Check that the saved instance is what we intended
        new = Playlist.objects.get(person=self.person, title=payload["title"])
        self.assertEqual(new.title, payload["title"])
        self.assertEqual(new.person, self.person)
        self.assertEqual(new.description, payload["description"])

    def test_PlaylistListViewSet_POST_defaults_other_fields(self):
        payload = {
            "person": self.urlname
        }
        response = self.client.post('/api/playlists/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #Check that the saved instance is what we intended
        new = Playlist.objects.filter(person=self.person)[0]
        self.assertIsNotNone(new.title)

    def test_PlaylistListViewSet_POST_by_nonowner_rejected(self):
        badurlname = 'http://testserver/api/people/jray/'
        payload = {
            "person": badurlname,
            "title": "bad playlist",
            "description": "bad playlist description"
        }
        response = self.client.post('/api/playlists/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PlaylistDetailViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.saved_playlists = Playlist.objects.all()
        self.numPlaylists = Playlist.objects.all().count()

    def test_PlaylistDetailViewSet_reverses_to_correct_url(self):
        url = reverse('playlist-detail', kwargs={'pk': self.saved_playlists[0].pk})
        self.assertEqual(url, '/api/playlists/' + str(self.saved_playlists[0].pk) + '/')

    def test_PlaylistDetailViewSet_resolves_to_correct_view(self):
        view = resolve('/api/playlists/' + str(self.saved_playlists[0].pk) + '/')
        #I don't know how to extract the name of the Class
        self.assertEqual(type(view.func).__name__, 'function')

    def test_PlaylistDetailViewSet_GET_returns_correct_playlist(self):
        target_playlist = Playlist.objects.filter(person=self.person)[0]
        response = self.client.get('/api/playlists/' + str(target_playlist.id) + '/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resp = json.loads(response.content.decode())
        self.assertEqual(self.urlname, resp['person'])
        self.assertEqual(target_playlist.id, resp['id'])

    def test_PlaylistDetailViewSet_PUT_by_owner_accepted(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        payload = {
            "person": self.urlname,
            "title": "updated playlist title",
            "description": myPlaylist.description
        }

        response = self.client.put('/api/playlists/' + str(myPlaylist.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # #Check that the saved instance is what we intended
        updatedPlaylist = Playlist.objects.get(person=self.person, title=payload["title"])
        self.assertEqual(updatedPlaylist.title, payload["title"])
        self.assertEqual(updatedPlaylist.person, self.person)
        self.assertEqual(updatedPlaylist.description, payload["description"])

    def test_PlaylistDetailViewSet_PUT_by_nonowner_rejected(self):
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherurlname = 'http://testserver/api/people/jvwong/'
        payload = {
            "person": otherurlname,
            "title": "updated playlist title",
            "description": otherPlaylist.description
        }
        response = self.client.put('/api/playlists/' + str(otherPlaylist.id) + '/', payload)
        data = response.data
        #print(data)

        #Should get a 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_PlaylistDetailViewSet_PUT_spoof_other_owner_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherurlname = 'http://testserver/api/people/jvwong/'
        payload = {
            "person": otherurlname,
            "title": "updated playlist title",
            "description": otherPlaylist.description
        }

        #Try to add a playlist under another person
        response = self.client.put('/api/playlists/' + str(myPlaylist.id) + '/', payload)
        data = response.data
        #print(data)

        #Should get a 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_PlaylistDetailViewSet_DELETE_by_owner_accepted(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]

        response = self.client.delete('/api/playlists/' + str(myPlaylist.id) + '/')
        data = response.data

        #Should get a 204
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        ##Check that the deleted instance is gone
        fetchedPlaylists = Playlist.objects.filter(pk=myPlaylist.id)
        self.assertEqual(len(fetchedPlaylists), 0)

    def test_PlaylistDetailViewSet_DELETE_by_nonowner_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherurlname = 'http://testserver/api/people/jvwong/'

        response = self.client.delete('/api/playlists/' + str(otherPlaylist.id) + '/')
        data = response.data
        #print(data)

        #Should get a 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_PlaylistDetailViewSet_PATCH_own_updates_existing_object(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        payload = {
            "title": "updated playlist title",
        }

        response = self.client.patch('/api/playlists/' + str(myPlaylist.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # #Check that the saved instance is what we intended
        updatedPlaylist = Playlist.objects.get(person=self.person, title=payload["title"])
        self.assertEqual(updatedPlaylist.title, payload["title"])
        self.assertEqual(updatedPlaylist.person, myPlaylist.person)
        self.assertEqual(updatedPlaylist.description, myPlaylist.description)


    ##NB: we needed PATCH for clips from others to update the plays field etc
    def test_PlaylistDetailViewSet_PATCH_other_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        payload = {
            "title": "updated playlist title",
        }

        response = self.client.patch('/api/playlists/' + str(otherPlaylist.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 403 created back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_PlaylistDetailViewSet_PATCH_PersonField_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherurlname = 'http://testserver/api/people/jvwong/'

        payload = {
            "person": otherurlname,
            "title": "updated playlist title",
        }

        response = self.client.patch('/api/playlists/' + str(myPlaylist.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 400 back
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

