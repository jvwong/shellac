import os
import json
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.db.models import Q

from shellac.models import Category, Clip, Person, Relationship

from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.test import APITestCase

audio_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../assets/song.mp3")


class RelationshipFixtureValidation(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        # Test definitions as before.
        pass

    def test_validateFixture(self):
        # Test for loaded User, Person, Clip, Category, Relationship
        users = User.objects.all()
        #print(users)
        self.assertTrue(len(users), 4)

        people = Person.objects.all()
        #print(people)
        self.assertTrue(len(people), 4)

        clips = Clip.objects.all()
        #print(clips)
        self.assertTrue(len(clips), 50)

        categories = Category.objects.all()
        #print(categories)
        self.assertTrue(len(categories), 16)

        rels_jvwong = Relationship.objects.filter(from_person=Person.objects.get(username='jvwong'))
        rels_aray = Relationship.objects.filter(from_person=Person.objects.get(username='aray'))
        rels_jray = Relationship.objects.filter(from_person=Person.objects.get(username='jray'))
        rels_kray = Relationship.objects.filter(from_person=Person.objects.get(username='kray'))
        self.assertEqual(len(rels_jvwong), 3)
        self.assertEqual(len(rels_aray), 1)
        self.assertEqual(len(rels_jray), 2)
        self.assertEqual(len(rels_kray), 0)



# """
#  BEGIN Person API
# """
class PersonListView(APITestCase):

    # line up view for '/'
    def test_PersonListView_url_resolves_to_api_category_view(self):
        url = reverse('person-list')
        self.assertEqual(url, '/api/people/')


    def test_PersonListView_GET_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        #print(response.data)
        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


class PersonDetailView(APITestCase):

    def test_PersonDetailView_url_resolves_to_correct_view(self):
        url = reverse('person-detail', kwargs={'username': 'jvwong'})
        self.assertEqual(url, '/api/people/jvwong/')

    def test_PersonDetailView_GET_same_Person_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/andrea/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_PersonDetailView_GET_other_Person_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/jvwong/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "jvwong"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

# """
#  BEGIN Relationship API
# """

class RelationshipListViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # view for '/api/relationships/'
    def test_RelationshipListViewSet_noparam_resolves_to_correct_view(self):
        url = reverse('relationship-list')
        self.assertEqual(url, '/api/relationships/')

    def test_RelationshipListViewSet_GET_returns_ALL_Rel_objects(self):
        response = self.client.get('/api/relationships/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        results = resp['results']
        #print(results)
        self.assertEqual(len(results), Relationship.objects.filter(
            Q(from_person=self.person) | Q(to_person=self.person)).count())

        for result in results:
            self.assertTrue(result['to_person'] == self.urlname or result['from_person'] == self.urlname)

    def test_RelationshipListViewSet_POST_creates_Relationship_with_target(self):
        qurlname = 'http://testserver/api/people/aray/'
        qstat = 'following'

        payload = {'from_person': qurlname, 'status': qstat, 'to_person': qurlname, 'private': False}

        response = self.client.post('/api/relationships/', payload)
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = json.loads(response.content.decode())
        self.assertEqual(response['from_person'], self.urlname)
        self.assertEqual(response['to_person'], qurlname)
        self.assertEqual(response['status'], qstat)


class RelationshipDetailViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/.json'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # line up view for '/'
    def test_RelationshipDetailViewSet_resolves_to_correct_view(self):
        url = reverse('relationship-detail', kwargs={'pk': 1})
        self.assertEqual(url, '/api/relationships/1/')

    # def test_RelationshipDetailViewSet_GET_returns_correct_REL_object(self):
    #     targetUser = User.objects.get(username='aray')
    #     urlname = 'http://testserver/api/people/aray/.json'
    #     qstat = 'following'
    #
    #     response = self.client.get('/api/relationships/' + targetUser.username + '/following/.json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #
    #     resp = json.loads(response.content.decode())
    #     results = resp['results']
    #     self.assertEqual(len(results), Relationship.objects.filter(
    #         Q(from_person=targetUser.person) & Q(status=qstat)).count())
    #
    #     for result in results:
    #         self.assertTrue(result['from_person'] == urlname and result['status'] == qstat)

