from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, SESSION_KEY, get_user_model
from django.contrib.sessions.backends.db import SessionStore
from selenium import webdriver
#from django.contrib.staticfiles.testing import StaticLiveServerCase
from selenium.webdriver.support.ui import WebDriverWait
import sys
User = get_user_model()
from shellac.models import Clip


def cleanClips():
    for c in Clip.objects.all():
        c.delete()

# ### The base class for all functional tests
# class FunctionalTest(StaticLiveServerCase):
#     @classmethod
#     def setUpClass(cls):
#         for arg in sys.argv:
#             if 'liveserver' in arg:
#                 cls.server_url = 'http://' + arg.split('=')[1]
#                 return
#         super().setUpClass()
#         cls.server_url = cls.live_server_url
#
#
#     @classmethod
#     def tearDOwnClass(cls):
#         if cls.server_url == cls.server_url:
#             super().tearDownClass()
#
#     def setUp(self):
#         self.browser = webdriver.Firefox()
#         self.browser.implicitly_wait(3)
#
#     def tearDown(self):
#         for c in Clip.objects.all():
#             c.delete()
#         self.browser.quit()
#
#     def wait_for_element_with_id(self, element_id):
#         WebDriverWait(self.browser, timeout=30).until(
#             lambda b: b.find_element_by_id(element_id),
#             'Could not find element with id {}. Page text was {}'.format(
#             element_id, self.browser.find_element_by_tag_name('body').text
#             )
#         )
#
#     def wait_to_be_signed_in(self, username):
#         self.wait_for_element_with_id('nav-navbar-right-bar-user')
#         user = self.browser.find_element_by_css_selector('#nav-navbar-right-bar-user')
#         self.assertIn(username, user.text)
#
#     def wait_to_be_signed_out(self, username):
#         self.wait_for_element_with_id('navbar-collapse-right-bar-signup')
#         signup = self.browser.find_element_by_css_selector('#navbar-collapse-right-bar-signup')
#         self.assertNotIn(username, signup.text)
#
#
#     def create_pre_authenticated_session(self, username):
#         self.user = User.objects.create(username=username)
#         session = SessionStore()
#         session[SESSION_KEY] = self.user.pk
#         session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[3]
#         session.save()
#
#         ### to set a cookie we need to first visit the domain
#         ## 404 pages load the quickest
#         self.browser.get(self.server_url + '/404_no_such_url/')
#         self.browser.add_cookie(dict(
#             name=settings.SESSION_COOKIE_NAME,
#             value=session.session_key,
#             path='/'
#         ))
#


# The file reference must be populated with a django.core.files.File instance
# but File cannot handle file-like objects such as those returned by urlopen -
# see http://code.djangoproject.com/ticket/8501
#
# Since we'd like to get the normal file name collision avoidance, automatic
# location handling, etc. we'll create a django NamedTemporaryFile because the
# default file storage save logic is smart enough to simply move the temporary
# file to the correct location.

from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from urllib.request import urlopen

def setFileAttributefromUrl(field, url, fname):
    f_temp = NamedTemporaryFile(delete=True)
    f_temp.write(urlopen(url).read())
    f_temp.flush()
    field.save(fname, File(f_temp), save=True)


def setFileAttributefromLocal(field, path, fname):
    with open(path, 'rb') as f:
        field.save(fname, File(f), save=True)


