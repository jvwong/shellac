from rest_framework import status
from rest_framework.test import APITestCase

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
import json
# """
#  BEGIN USER API
# """
class UserListViewSet(APITestCase):

    # line up view for '/'
    def test_UserListViewSet_url_resolves_to_api_category_view(self):
        url = reverse('user-list')
        self.assertEqual(url, '/api/users/')


    def test_UserListViewSet_GET_byStaff_returns_correct_response(self):
        u  = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/users/.json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        #print(response.data)
        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertIn('"username": "jvwong"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_UserListViewSet_GET_byNonStaff_returns_correct_403FORBIDDEN(self):
        u  = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/users/.json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        #print(response.data)

    def test_UserListViewSet_POST_by_unauthenticated_creates_new_user(self):

        payload = json.dumps({'username': 'ronald', 'password': 'ron'})

        response = self.client.post('/api/users/.json', payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #print(response.data)
        self.assertIn('"username": "ronald"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')



class UserDetailViewSet(APITestCase):

    # line up view for '/'
    def test_UserDetail_username_user_url_resolves_to_api_userlist_view(self):
        url = reverse('user-detail', kwargs={'username': 'jvwong'})
        self.assertEqual(url, '/api/users/jvwong/')

    def test_UserDetailViewSet_GET_same_User_bynonstaff_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/users/andrea/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertIn('"email": "aray@outlook.com"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_UserDetailViewSet_GET_other_User_bynonstaff_returns_correct_response(self):
        User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/users/jvwong/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_UserDetailViewSet_GET_other_User_bystaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.get('/api/users/jvwong/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "jvwong"', response.content.decode())
        self.assertIn('"email": "jray@outlook.com"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_UserDetailViewSet_PUT_same_bynonstaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')
        response = self.client.put('/api/users/andrea/', data={'username': 'andrea',
                                                               'email': 'aray2@outlook.com'})
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "andrea"', response.content.decode())
        self.assertIn('"email": "aray2@outlook.com"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_UserDetailViewSet_PUT_other_bynonstaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.client.login(username='jvwong', password='j')
        response = self.client.put('/api/users/andrea/', data={'username': 'andrea',
                                                               'email': 'aray2@outlook.com'})
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_UserDetailViewSet_PUT_other_byStaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')

        self.client.login(username='andrea', password='a')
        response = self.client.put('/api/users/jvwong/', data={'username': 'jvwong',
                                                               'email': 'jray2@outlook.com'})
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('"username": "jvwong"', response.content.decode())
        self.assertIn('"email": "jray2@outlook.com"', response.content.decode())
        self.assertEqual(response.__getitem__('Content-Type'), 'application/json')

    def test_UserDetailViewSet_DELETE_same_bynonstaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        self.client.login(username='andrea', password='a')
        response = self.client.delete('/api/users/andrea/')
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_UserDetailViewSet_DELETE_other_bynonstaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.client.login(username='jvwong', password='a')
        response = self.client.delete('/api/users/andrea/')
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_UserDetailViewSet_DELETE_other_byStaff_returns_correct_response(self):
        u = User.objects.create_user('andrea', email='aray@outlook.com', password='a')
        u.is_staff = True
        u.save()
        u2 = User.objects.create_user('jvwong', email='jray@outlook.com', password='j')
        self.client.login(username='andrea', password='a')
        response = self.client.delete('/api/users/jvwong/')
        #print(response.data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)