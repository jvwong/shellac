from shellac.models import Playlist, Person

from django.test import TestCase
from django.contrib.auth.models import User

class PlaylistModelTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_created_Playlist_stores_reference_to_Person(self):
        #create the playlist for aray
        playlist = Playlist.objects.create(person=self.person)

        self.assertEqual(playlist.person, self.person)
        self.assertEqual(playlist.person.username, self.person.username)

    def test_Person_has_reference_to_new_Playlists(self):
        #create the playlist for aray
        #Note the related_name will be playlists on the Person
        #Note the related_query_name will be playlist on the Person
        playlist1 = Playlist.objects.create_playlist(person=self.person, title='aray playlist 1')
        playlist2 = Playlist.objects.create_playlist(person=self.person, title='aray playlist 2')

        self.assertEqual(len(self.person.playlists.all()), Playlist.objects.filter(person=self.person).count())
        self.assertEqual(self.person.playlists.filter(title='aray playlist 1')[0], playlist1)
        self.assertEqual(Person.objects.filter(playlist__title='aray playlist 1')[0], playlist1.person)

    def test_new_playlist_has_default_title(self):
        #create the playlist for aray
        #Note the related_name will be playlists on the Person
        playlist1 = Playlist.objects.create(person=self.person)
        self.assertTrue(type(playlist1.title) is str)
        self.assertEqual(len(playlist1.title.split('_')), 4)