from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.test.client import RequestFactory

# """
#  BEGIN User page unit testing
# """
class UserDetailsPage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        self.factory = RequestFactory()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.client.login(username=username, password=password)

    def test_UserDetails_url_returns_correct_url(self):
        url = reverse('user_detail', kwargs={'pk': self.userid})
        self.assertEqual(url, '/user/' + self.userid + '/')

    def test_UserDetails_url_returns_correct_details(self):
        response = self.client.get('/user/' + self.userid + '/')
        expected_html = render_to_string('shellac/user/user_detail.html', {'object': self.user, 'user': self.user})
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shellac/user/user_detail.html')
        self.assertEqual(response.content.decode(), expected_html)

    def test_UserDetails_url_inaccessble_to_other_user(self):
        #logged in as jray, try to get jvwong stuff nononno
        u = User.objects.get(username='jvwong')
        response = self.client.get('/user/' + str(u.id) + '/')
        #print(response.status_code)
        self.assertEqual(response.status_code, 403)

    def test_UserDetails_url_rejects_unauthenticated_access_attempt(self):
        self.client.logout()
        response = self.client.get('/user/' + self.userid + '/')
        self.assertEqual(response.status_code, 302)



class UserUpdatePage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        self.factory = RequestFactory()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.client.login(username=username, password=password)

    def test_UserUpdate_url_returns_correct_url(self):
        url = reverse('user_update', kwargs={'pk': self.userid})
        self.assertEqual(url, '/user/' + self.userid + '/update/')

    def test_UserUpdate_url_returns_form_details(self):
        response = self.client.get('/user/' + self.userid + '/update/')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shellac/user/user_update.html')
        expected_html = render_to_string('shellac/user/user_update.html', {'object': self.user, 'user': self.user})
        self.assertContains(response, 'username')
        self.assertIn('type="text" value="' + self.user.username + '" name="username"', expected_html)
        self.assertIn('type="text" value="' + self.user.first_name + '" name="first_name"', expected_html)
        self.assertIn('type="text" value="' + self.user.last_name + '" name="last_name"', expected_html)
        self.assertIn('type="email" value="' + self.user.email + '" name="email"', expected_html)

    def test_UserUpdate_url_inaccessble_to_other_user(self):
        #logged in as jray, try to get jvwong stuff nononno
        u = User.objects.get(username='jvwong')
        response = self.client.get('/user/' + str(u.id) + '/update/')
        #print(response.status_code)
        self.assertEqual(response.status_code, 403)

    def test_UserUpdate_url_rejects_unauthenticated_access_attempt(self):
        self.client.logout()
        response = self.client.get('/user/' + self.userid + '/update/')
        self.assertEqual(response.status_code, 302)


class UserDeletePage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        self.factory = RequestFactory()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.client.login(username=username, password=password)

    def test_UserDelete_url_returns_correct_url(self):
        url = reverse('user_delete', kwargs={'pk': self.userid})
        self.assertEqual(url, '/user/' + self.userid + '/delete/')

    def test_UserDelete_url_returns_correct_details(self):
        response = self.client.get('/user/' + self.userid + '/delete/')
        expected_html = render_to_string('shellac/user/user_check_delete.html', {'object': self.user, 'user': self.user})
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shellac/user/user_check_delete.html')

    def test_UserDelete_url_inaccessble_to_other_user(self):
        #logged in as jray, try to delete jvwong stuff nononno
        u = User.objects.get(username='jvwong')
        response = self.client.get('/user/' + str(u.id) + '/delete/')
        #print(response.status_code)
        self.assertEqual(response.status_code, 403)

    def test_UserDelete_url_rejects_unauthenticated_access_attempt(self):
        self.client.logout()
        response = self.client.get('/user/' + self.userid + '/delete/')
        self.assertEqual(response.status_code, 302)
