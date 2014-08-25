from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.app import shellac_app

##Fake user
username_dummy = 'jvwong'
password_dummy = 'b'
email_dummy = 'jvwong@outlook.com'

class AppPageTest(TestCase):

    # line up view for '/' with app_page
    def test_root_url_resolvers_to_app_page_view(self):
        found = resolve('/')
        self.assertEqual(found.func, shellac_app)

    # line up view for '/' with app_page
    def test_app_page_returns_correct_html(self):
        user = User.objects.create_user(username_dummy, password_dummy, email_dummy)
        request = HttpRequest()
        request.user = user
        response = shellac_app(request)
        expected_html = render_to_string('shellac/app.html', {'user': user})
        self.assertEqual(response.content.decode(), expected_html)
