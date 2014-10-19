from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.app import shellac_app

class AppPageTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    # line up view for '/' with app_page
    def test_root_url_resolvers_to_app_page_view(self):
        found = resolve('/')
        self.assertEqual(found.func, shellac_app)

    # line up view for '/app/(?<username>[\w.@+-]+)/' with app_page
    def test_root_url_resolvers_to_app_page_view(self):
        found = resolve('/player/jvwong/following/')
        self.assertEqual(found.func, shellac_app)

    #This is dynamic javascript so cannot judge html
    def test_app_page_returns_correct_template(self):
        request = HttpRequest()
        request.user = self.user
        response = shellac_app(request)
        self.assertTemplateUsed(response, 'shellac/app/app.html')



