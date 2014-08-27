from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.accounts import user_signup, user_signin
from django.contrib.auth import get_user_model
User = get_user_model()

##Fake user
username_dummy = 'jvwong'
password_dummy = 'b'
email_dummy = 'jvwong@outlook.com'

# GET /users/signin
class SigninPageTest(TestCase):

    def test_signin_url_resolvers_to_user_signin_page_view(self):
        found = resolve('/users/signin/')
        self.assertEqual(found.func, user_signin)

    def test_signin_page_returns_correct_html(self):
        request = HttpRequest()
        response = user_signin(request)
        expected_html = render_to_string('accounts/signin.html')
        self.assertEqual(response.content.decode(), expected_html)


# GET /users/signup
from shellac.forms import UserCreateForm
class SignupPageTest(TestCase):

    def test_signup_url_resolvers_to_user_signup_page_view(self):
        found = resolve('/users/signup/')
        self.assertEqual(found.func, user_signup)

    def test_signup_page_returns_correct_html(self):
        request = HttpRequest()
        response = user_signup(request)
        form = UserCreateForm()
        expected_html = render_to_string('accounts/signup.html', {'form': form})
        self.assertEqual(expected_html, response.content.decode())

