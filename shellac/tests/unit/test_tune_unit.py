from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string

from shellac.views.app import shellac_tune

# """
#  BEGIN Tune page unit testing
# """
class TunePage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_tune_url_returns_correct_url(self):
        url = reverse('shellac_tune')
        self.assertEqual(url, '/tune/')

    def test_tune_url_resolves_to_correct_view(self):
        found = resolve('/tune/')
        self.assertEqual(found.func, shellac_tune)

    def test_tune_page_returns_correct_html(self):
        request = HttpRequest()
        request.user = self.user
        response = shellac_tune(request)
        expected_html = render_to_string('shellac/app/tune.html', {'user': self.user})
        self.assertEqual(response.content.decode(), expected_html)