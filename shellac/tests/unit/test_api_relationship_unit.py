import os
import json
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.db.models import Q

from shellac.models import Category, Clip, Person, Relationship

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
class PersonDetailCurrentView(APITestCase):

    def test_PersonDetailCurrentView_url_resolves_to_api_category_view(self):
        url = reverse('person-current')
        self.assertEqual(url, '/api/people/current/')


    def test_PersonDetailCurrentView_GET_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/current/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # print(response.data)
        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


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

    def test_PersonListView_GET_paginate_returns_correct_number_of_records(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.assertEqual(User.objects.all().count(), 2)

        n = 1

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/people/.json?page_size=' + str(n))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data['results']
        #print(results)
        self.assertEqual(len(results), n)


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


class PersonListStatusView(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jray'
        password = 'jray'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_PersonListStatusView_url_resolves_to_api_category_view(self):
        url = reverse('person-list-status', kwargs={'status': self.status, 'username': self.person.username})
        self.assertEqual(url, '/api/people/' + self.status + '/' + self.person.username + '/')

    def test_PersonListStatusView_GET_following_returns_correct_Person_list(self):
        # jray --> jvwong; # jray --> kray;

        qurl = '/api/people/following/' + self.person.username + '/'
        response = self.client.get(qurl)
        resp = json.loads(response.content.decode())['results']
        #print((resp))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp), 2)
        self.assertEqual(resp[0]['username'], 'jvwong')
        self.assertEqual(resp[1]['username'], 'kray')
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_PersonListStatusView_GET_followers_returns_correct_Person_list(self):
        # aray --> jray; # jvwong--> jray;

        qurl = '/api/people/followers/' + self.person.username + '/'
        response = self.client.get(qurl)
        resp = json.loads(response.content.decode())['results']
        #print((resp))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp), 2)
        self.assertEqual(resp[0]['username'], 'aray')
        self.assertEqual(resp[1]['username'], 'jvwong')
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_PersonListStatusView_GET_friends_returns_correct_Person_list(self):
        # jvwong --> jray; # jray --> jvwong

        qurl = '/api/people/friends/' + self.person.username + '/'
        response = self.client.get(qurl)
        resp = json.loads(response.content.decode())['results']
        #print((resp))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp), 1)
        self.assertEqual(resp[0]['username'], 'jvwong')
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')


    def test_PersonListStatusView_GET_blocked_returns_correct_Person_list(self):
        qurl = '/api/people/blocked/' + self.person.username + '/'
        response = self.client.get(qurl)
        resp = json.loads(response.content.decode())['results']
        #print((resp))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp), 0)
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_PersonListStatusView_GET_paginate_returns_correct_number_of_records(self):
        n = 1
        qstatus = 'following'
        qusername = 'jvwong'
        qurl = '/api/people/followers/' + self.person.username + '/.json?page_size=' + str(n)

        response = self.client.get(qurl)
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'results')

        results = response.data['results']
        #print(results)
        self.assertEqual(len(results), n)


# """
#  BEGIN Relationship API
# """

class RelationshipListViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # view for '/api/relationships/'
    def test_RelationshipListViewSet_noparam_resolves_to_correct_view(self):
        url = reverse('relationship-list')
        self.assertEqual(url, '/api/relationships/')

    def test_RelationshipListViewSet_GET_returns_ALL_Rel_objects_for_User(self):
        response = self.client.get('/api/relationships/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        results = resp['results']
        #print(results)
        self.assertEqual(len(results), Relationship.objects.filter(
            Q(from_person=self.person) | Q(to_person=self.person)).count())

        for result in results:
            self.assertTrue(result['to_person'] == self.urlname or result['from_person'] == self.urlname)

    def test_RelationshipListViewSet_POST_owner_creates_Relationship_with_target(self):
        ## sample curl request
        #curl -X POST http://localhost:8000/api/relationships/ -H "Authorization:Token 180d6d22335f2471f717ce3c121eebc47a0fa2a8" -H "Content-Type: application/json" -d '{"from_person": "http://localhost:8000/api/people/aray/", "status": "following", "to_person": "http://localhost:8000/api/people/new/", "private": "False"}'

        ###logged in -- aray
        qurlname = 'http://testserver/api/people/jvwong/'
        qstat = 'following'

        payload = {'from_person': self.urlname, 'status': qstat, 'to_person': qurlname, 'private': False}
        response = self.client.post('/api/relationships/', payload)
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(response.data['from_person'], self.urlname)
        self.assertEqual(response.data['to_person'], qurlname)
        self.assertEqual(response.data['status'], qstat)

    def test_RelationshipListViewSet_POST_owner_ignores_self_Relationship(self):
        ###logged in -- aray
        qurlname = 'http://testserver/api/people/aray/'
        qstat = 'following'

        payload = {'from_person': self.urlname, 'status': qstat, 'to_person': qurlname, 'private': False}

        response = self.client.post('/api/relationships/', payload)
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_RelationshipListViewSet_POST_owner_is_idempotent(self):
        ###logged in -- aray
        qurlname = 'http://testserver/api/people/jvwong/'
        qstat = 'following'

        payload = {'from_person': self.urlname, 'status': qstat, 'to_person': qurlname, 'private': False}
        response1 = self.client.post('/api/relationships/', payload)
        response2 = self.client.post('/api/relationships/', payload)

        rels = Relationship.objects.filter(from_person=Person.objects.get(username='aray'), to_person=Person.objects.get(username='jvwong'))
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(rels), 1)


    def test_RelationshipListViewSet_POST_nonowner_forbidden(self):
        ###logged in -- aray
        ### try kray -- > jray
        qurlname = 'http://testserver/api/people/jray/'
        qstat = 'following'

        payload = {'from_person': 'http://testserver/api/people/kray/', 'status': qstat, 'to_person': qurlname, 'private': False}

        response = self.client.post('/api/relationships/', payload)
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_RelationshipListViewSet_POST_nonowner_bystaff_OK(self):
        ###logged in -- aray
        ### try kray -- > jray
        surlname = 'http://testserver/api/people/kray/'
        qurlname = 'http://testserver/api/people/jray/'
        qstat = 'following'

        payload = {'from_person': surlname, 'status': qstat, 'to_person': qurlname, 'private': False}

        self.client.login(username='jvwong', password='b')
        response = self.client.post('/api/relationships/', payload)
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(response.data['from_person'], surlname)
        self.assertEqual(response.data['to_person'], qurlname)
        self.assertEqual(response.data['status'], qstat)


    def test_RelationshipListViewSet_GET_paginate_returns_correct_number_of_records(self):
        n = 1

        self.client.login(username='jvwong', password='b')
        response = self.client.get('/api/relationships/.json?page_size=' + str(n))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data['results']
        #print(results)
        self.assertEqual(len(results), n)



class RelationshipDetailViewSet(APITestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'aray'
        password = 'aray'
        self.status = 'following'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_RelationshipDetailViewSet_resolves_to_correct_view(self):
        url = reverse('relationship-detail', kwargs={'pk': 1})
        self.assertEqual(url, '/api/relationships/1/')

    def test_RelationshipDetailViewSet_GET_by_owner_returns_correct_REL_object(self):
        ### aray --> jray
        rel_a_j = Relationship.objects.get(from_person=self.person, to_person=Person.objects.get(username='jray'))
        pk = rel_a_j.pk

        qurl = '/api/relationships/' + str(pk) + '/'
        response = self.client.get(qurl)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        #print(resp)
        self.assertEqual(resp['id'], pk)

    def test_RelationshipDetailViewSet_GET_other_nonstaff_OK(self):
        ### jray --> kray
        rel_j_k = Relationship.objects.get(from_person=Person.objects.get(username='jray'), to_person=Person.objects.get(username='kray'))
        pk = rel_j_k.pk
        qurl = '/api/relationships/' + str(pk) + '/'
        response = self.client.get(qurl)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp = json.loads(response.content.decode())
        #print(resp)
        self.assertEqual(resp['id'], pk)

    def test_RelationshipDetailViewSet_PUT_by_owner_updates_object(self):
        ### update (Rel pk=6): aray(2) -- > jray(3)
        surlname = 'http://testserver/api/people/aray/'
        qurlname = 'http://testserver/api/people/jray/'
        qstat = 'blocked'
        qprivate = True
        rel_a_j = Relationship.objects.get(from_person=self.person, to_person=Person.objects.get(username='jray'))
        pk = rel_a_j.pk
        payload = {'from_person': surlname,
                   'to_person': qurlname,
                   'status': qstat,
                   'private': qprivate}

        response = self.client.put('/api/relationships/' + str(pk) + '/', data=payload)
        data = response.data
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['status'], qstat)
        self.assertEqual(data['private'], True)

    def test_RelationshipDetailViewSet_PUT_by_nonowner_forbidden(self):
        ### update (Rel pk=5): jray(3) -- > kray(4)
        surlname = 'http://testserver/api/people/jray/'
        qurlname = 'http://testserver/api/people/kray/'
        qstat = 'blocked'
        qprivate = True

        #get the pk
        jray = Person.objects.get(username='jray')
        kray = Person.objects.get(username='kray')

        rel = Relationship.objects.get(from_person=jray, to_person=kray)
        # print(rel.id)

        payload = {'from_person': surlname,
                   'to_person': qurlname,
                   'status': qstat,
                   'private': qprivate}

        response = self.client.put('/api/relationships/' + str(rel.id) + '/', data=payload)
        data = response.data
        # print(data)
        # print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_RelationshipDetailViewSet_PUT_other_bystaff_OK(self):
        ### update (Rel pk=6): aray(2) -- > jray(3)
        surlname = 'http://testserver/api/people/aray/'
        qurlname = 'http://testserver/api/people/jray/'
        qstat = 'blocked'
        qprivate = True

        payload = {'from_person': surlname,
                   'to_person': qurlname,
                   'status': qstat,
                   'private': qprivate}

        self.client.login(username='jvwong', password='b')
        response = self.client.put('/api/relationships/6/', data=payload)
        data = response.data
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['status'], qstat)
        self.assertEqual(data['private'], True)

    def test_RelationshipDetailViewSet_DELETE_by_owner_deletes(self):
        ##logged in as aray
        ### delete: aray -- > jray
        rel_a_j = Relationship.objects.get(from_person=self.person, to_person=Person.objects.get(username='jray'))

        response = self.client.delete('/api/relationships/' + str(rel_a_j.pk) + '/')
        # data = response.data
        # print(response.data)
        # #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(Relationship.objects.filter(pk=rel_a_j.pk)), 0)

    def test_RelationshipDetailViewSet_DELETE_by_nonowner_rejected(self):
        ### delete jray -- > kray
        rel_j_k = Relationship.objects.get(from_person=Person.objects.get(username='jray'), to_person=Person.objects.get(username='kray'))

        response = self.client.delete('/api/relationships/' + str(rel_j_k.pk) + '/')
        #data = response.data
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(len(Relationship.objects.filter(pk=rel_j_k.pk)), 1)

    def test_RelationshipDetailViewSet_DELETE_by_staff_deletes(self):
        ### update (Rel pk=6): aray(2) -- > jray(3)
        pk = 6
        self.client.login(username='jvwong', password='b')
        response = self.client.delete('/api/relationships/' + str(pk) + '/')
        #data = response.data
        #print(response.data)
        #print(response.status_code)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(Relationship.objects.filter(pk=pk)), 0)

