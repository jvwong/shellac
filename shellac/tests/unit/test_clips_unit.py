import os
import json

from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string

from shellac.views.clips import shellac_clip_create, ClipUpdateView, ClipDeleteView
from shellac.forms import CreateClipForm

# CRUD
class ClipCreateView(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_shellac_clips_create_url_resolves_correctly_view(self):
        url = reverse('shellac_clip_create')
        self.assertEqual(url, '/clips/create/')

    def test_create_url_resolves_to_create_page_view(self):
        found = resolve('/clips/create/')
        self.assertEqual(found.func, shellac_clip_create)

    def test_record_page_returns_correct_html(self):
        request = HttpRequest()
        request.user = self.user
        response = shellac_clip_create(request)
        form = CreateClipForm()
        expected_html = render_to_string('shellac/clips/create.html', {'form': form, 'user': self.user})
        self.assertEqual(response.content.decode(), expected_html)


class ClipDetailView(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_ClipDetailView_url_resolves_correctly_url(self):
        url = reverse('shellac_clip_detail', kwargs={'pk': 2})
        self.assertEqual(url, '/clips/2/detail/')

    def test_ClipDetailView_resolves_to_create_page_view(self):
        found = resolve('/clips/1/detail/')
        self.assertEqual(found.func.__class__.__name__, 'function')

    def test_ClipDetailView_applies_correct_template(self):
        response = self.client.get('/clips/2/detail/')
        self.assertTemplateUsed(response, 'shellac/clips/clip_detail.html')


class ClipUpdateView(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_ClipUpdateView_url_resolves_correctly_url(self):
        url = reverse('shellac_clip_update', kwargs={'pk': 1})
        self.assertEqual(url, '/clips/1/update/')

    def test_ClipUpdateView_resolves_to_create_page_view(self):
        found = resolve('/clips/1/update/')
        self.assertEqual(found.func.__class__.__name__, 'function')

    def test_ClipUpdateView_applies_correct_template(self):
        response = self.client.get('/clips/1/update/')
        self.assertTemplateUsed(response, 'shellac/clips/clip_update_form.html')

    def test_ClipUpdateView_forbids_GET_other_clip(self):
        response = self.client.get('/clips/4/update/') ##
        self.assertEqual(response.status_code, 403)

    def test_ClipUpdateView_url_inaccessble_to_other_user(self):
        #logged in as jvwong(1), try to update kray stuff nononno
        response = self.client.get('/clips/4/update/')
        self.assertEqual(response.status_code, 403)

    def test_ClipUpdateView_url_rejects_unauthenticated_access_attempt(self):
        self.client.logout()
        response = self.client.get('/clips/4/update/')
        self.assertEqual(response.status_code, 302)


class ClipDeleteView(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_ClipDeleteView_url_resolves_correctly_url(self):
        url = reverse('shellac_clip_confirm_delete', kwargs={'pk': 1})
        self.assertEqual(url, '/clips/1/delete/')

    def test_ClipDeleteView_resolves_to_create_page_view(self):
        found = resolve('/clips/1/delete/')
        self.assertEqual(found.func.__class__.__name__, 'function')

    def test_ClipDeleteView_applies_correct_template(self):
        response = self.client.get('/clips/1/delete/')
        self.assertTemplateUsed(response, 'shellac/clips/clip_confirm_delete.html')

    def test_ClipDeleteView_url_inaccessble_to_other_user(self):
        #logged in as jvwong(1), try to delete kray stuff nononno
        response = self.client.get('/clips/4/delete/')
        self.assertEqual(response.status_code, 403)

    def test_ClipDeleteView_url_rejects_unauthenticated_access_attempt(self):
        self.client.logout()
        response = self.client.get('/clips/4/delete/')
        self.assertEqual(response.status_code, 302)


class ClipListView(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'b'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_ClipListView_url_resolves_correctly_url(self):
        url = reverse('shellac_clip_list')
        self.assertEqual(url, '/clips/list/')

    def test_ClipListView_resolves_to_create_page_view(self):
        found = resolve('/clips/list/')
        self.assertEqual(found.func.__class__.__name__, 'function')

    def test_ClipListView_applies_correct_template(self):
        response = self.client.get('/clips/list/')
        self.assertTemplateUsed(response, 'shellac/clips/clip_list.html')