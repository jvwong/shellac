import json

from rest_framework import status
from rest_framework.test import APITestCase

from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import User

from shellac.models import Playlist, Track, Person, Clip

class TrackListViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.saved_tracks = Track.objects.all()
        self.numTracks = Track.objects.all().count()

    def test_TrackListViewSet_reverses_to_correct_url(self):
        url = reverse('track-list')
        self.assertEqual(url, '/api/tracks/')

    def test_TrackListViewSet_resolves_to_correct_view(self):
        view = resolve('/api/tracks/')
        #I don't know how to extract the name of the Class
        self.assertEqual(type(view.func).__name__, 'function')

    def test_TrackListViewSet_GET_returns_correct_list(self):
        response = self.client.get('/api/tracks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resp = json.loads(response.content.decode())
        results = resp['results']
        # print(results)

        #Returns the correct number of playlists
        self.assertEqual(len(results), self.numTracks)

        #Returns the correct playlists -- query ordering etc should be identical
        for p in range(self.numTracks):
            self.assertTrue(self.saved_tracks[p], results[p])

    def test_TrackListViewSet_POST_to_own_playlist_accepted(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myClip = Clip.objects.filter(author=self.person)[0]

        payload = {
            "playlist": 'http://testserver/api/playlists/' + str(myPlaylist.id) + '/',
            "position": 0,
            "clip": 'http://testserver/api/clips/' + str(myClip.id) + '/',
        }
        response = self.client.post('/api/tracks/', payload)
        data = response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #Check that the saved instance is what we intended
        new = Track.objects.get(playlist=myPlaylist, clip=myClip)
        self.assertEqual(new.playlist, myPlaylist)
        self.assertEqual(new.position, 0)
        self.assertEqual(new.clip, myClip)

    def test_TrackListViewSet_POST_to_other_playlist_rejected(self):
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myClip = Clip.objects.filter(author=self.person)[0]

        payload = {
            "playlist": 'http://testserver/api/playlists/' + str(otherPlaylist.id) + '/',
            "position": 0,
            "clip": 'http://testserver/api/clips/' + str(myClip.id) + '/',
        }
        response = self.client.post('/api/tracks/', payload)
        data = response.data
        #print(data)

        #Should get a 403 back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TrackDetailViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.saved_tracks = Track.objects.all()
        self.numTracks = Track.objects.all().count()

    def test_TrackDetailViewSet_reverses_to_correct_url(self):
        url = reverse('track-detail', kwargs={'pk': self.saved_tracks[0].pk})
        self.assertEqual(url, '/api/tracks/' + str(self.saved_tracks[0].pk) + '/')

    def test_TrackDetailViewSet_resolves_to_correct_view(self):
        view = resolve('/api/tracks/' + str(self.saved_tracks[0].pk) + '/')
        #I don't know how to extract the name of the Class
        self.assertEqual(type(view.func).__name__, 'function')

    def test_TrackDetailViewSet_GET_returns_correct_track(self):
        target_track = self.saved_tracks[0]
        response = self.client.get('/api/tracks/' + str(target_track.id) + '/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resp = json.loads(response.content.decode())

        #print(resp)
        self.assertEqual(target_track.id, resp['id'])


    def test_TrackDetailViewSet_PUT_by_playlist_owner_accepted(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myTrack = Track.objects.filter(playlist=myPlaylist)[0]
        payload = {
            "playlist": 'http://testserver/api/playlists/' + str(myTrack.playlist.id) + '/',
            "position": 1000,
            "clip": 'http://testserver/api/clips/' + str(myTrack.clip.id) + '/',
        }

        response = self.client.put('/api/tracks/' + str(myTrack.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 201 created back
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # #Check that the saved instance is what we intended
        updated = Track.objects.get(playlist=myPlaylist, clip=myTrack.clip)
        self.assertEqual(updated.position, payload["position"])


    def test_TrackDetailViewSet_PUT_cannot_hijack_anothers_track(self):
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherTrack = Track.objects.filter(playlist=otherPlaylist)[0]
        payload = {
            "playlist": 'http://testserver/api/playlists/' + str(otherTrack.playlist.id) + '/',
            "position": 1000,
            "clip": 'http://testserver/api/clips/' + str(otherTrack.clip.id) + '/',
        }

        response = self.client.put('/api/tracks/' + str(otherTrack.id) + '/', payload)
        data = response.data
        #print(data)

        #Should get a 403 back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_TrackDetailViewSet_DELETE_by_playlist_owner_accepted(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myTrack = Track.objects.filter(playlist=myPlaylist)[0]

        response = self.client.delete('/api/tracks/' + str(myTrack.id) + '/')
        data = response.data

        #Should get a 204
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        ##Check that the deleted instance is gone
        fetched = Track.objects.filter(pk=myTrack.id)
        self.assertEqual(len(fetched), 0)

    def test_TrackDetailViewSet_DELETE_by_nonowner_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherTrack = Track.objects.filter(playlist=otherPlaylist)[0]

        response = self.client.delete('/api/tracks/' + str(otherTrack.id) + '/')
        data = response.data
        #print(data)

        #Should get a 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_TrackDetailViewSet_PATCH_own_updates_existing(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myTrack = Track.objects.filter(playlist=myPlaylist)[0]
        payload = {
            "position": 1000,
        }

        response = self.client.patch('/api/tracks/' + str(myTrack.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 200 OK back
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # #Check that the saved instance is what we intended
        updated = Track.objects.get(playlist=myTrack.playlist, clip=myTrack.clip)
        self.assertEqual(updated.position, payload["position"])


    def test_TrackDetailViewSet_PATCH_other_rejected(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]
        otherTrack = Track.objects.filter(playlist=otherPlaylist)[0]

        payload = {
            "position": 1000,
        }

        response = self.client.patch('/api/tracks/' + str(otherTrack.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 403 back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


    ##This is forbidden since its not in the Track.PATCHABLE list
    def test_TrackDetailViewSet_PATCH_own_with_other_playlist_rejected_non_patchable_field(self):
        myPlaylist = Playlist.objects.filter(person=self.person)[0]
        myTrack = Track.objects.filter(playlist=myPlaylist)[0]

        otherPlaylist = Playlist.objects.filter(person=Person.objects.get(username='jvwong'))[0]


        payload = {
            "playlist": 'http://testserver/api/playlists/' + str(otherPlaylist.id) + '/',
            "position": 1000,
        }

        response = self.client.patch('/api/tracks/' + str(myTrack.id) + '/', payload)
        data =response.data
        #print(data)

        #Should get a 403 back
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

