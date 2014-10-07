import os
import json

from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string

from shellac.views.clips import shellac_clips_create
from shellac.forms import CreateClipForm

# GET /
class CreatePageTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'jvwong'
        self.urlname = 'http://testserver/api/people/' + username + '/'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_shellac_clips_create_url_resolves_correctly_view(self):
        url = reverse('shellac_clips_create')
        self.assertEqual(url, '/clips/create/')

    def test_create_url_resolves_to_create_page_view(self):
        found = resolve('/clips/create/')
        self.assertEqual(found.func, shellac_clips_create)

    def test_record_page_returns_correct_html(self):
        request = HttpRequest()
        request.user = self.user
        response = shellac_clips_create(request)
        form = CreateClipForm()
        expected_html = render_to_string('shellac/clips/create.html', {'form': form, 'user': self.user})
        self.assertEqual(response.content.decode(), expected_html)
