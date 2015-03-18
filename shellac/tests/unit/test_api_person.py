import json
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase


# """
#  BEGIN Person API
# """
class PersonDetailCurrentView(APITestCase):

    def test_PersonDetailCurrentView_url_resolves_to_api_category_view(self):
        url = reverse('person-current')
        self.assertEqual(url, '/api/person/')


    def test_PersonDetailCurrentView_GET_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/person/.json')
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
