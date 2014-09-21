from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.accounts import user_accounts_signup, user_accounts_signin
from django.contrib.auth import get_user_model
User = get_user_model()

##Fake user
username_dummy = 'jvwong'
password_dummy = 'b'
email_dummy = 'jvwong@outlook.com'


