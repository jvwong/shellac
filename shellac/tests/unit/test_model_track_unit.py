from shellac.models import Clip, Playlist, Track

from django.test import TestCase
from django.contrib.auth.models import User

class TrackModelTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.playlist = Playlist.objects.create(person=self.person)
        self.clip1 = Clip.objects.get(title='aray1', author=self.person)
        self.clip2 = Clip.objects.get(title='aray2', author=self.person)

    def test_created_Track_stores_reference_to_Clip(self):
        track1 = Track.objects.create(clip=self.clip1, playlist=self.playlist)
        track2 = Track.objects.create(clip=self.clip2, playlist=self.playlist)

        self.assertEqual(track1.playlist, self.playlist)
        self.assertEqual(track1.clip, self.clip1)

    def test_Playlist_has_reference_to_new_Tracks(self):
        #related_name on playlist will be tracks
        #related_query_name on playlist will be track
        track1 = Track.objects.create(clip=self.clip1, playlist=self.playlist)
        track2 = Track.objects.create(clip=self.clip2, playlist=self.playlist)

        self.assertEqual(self.playlist.tracks.all().count(), 2)
        self.assertEqual(Playlist.objects.filter(track__clip=self.clip1)[0], self.playlist)

    def test_new_track_has_default_position(self):
        #create the track for aray
        track1 = Track.objects.create(clip=self.clip1, playlist=self.playlist)
        self.assertEqual(track1.position, 0)