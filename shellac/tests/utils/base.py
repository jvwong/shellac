from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, SESSION_KEY, get_user_model
from django.contrib.sessions.backends.db import SessionStore
from selenium import webdriver
from django.contrib.staticfiles.testing import StaticLiveServerCase
from selenium.webdriver.support.ui import WebDriverWait
import sys
User = get_user_model()

### The base class for all functional tests
class FunctionalTest(StaticLiveServerCase):
    @classmethod
    def setUpClass(cls):
        for arg in sys.argv:
            if 'liveserver' in arg:
                cls.server_url = 'http://' + arg.split('=')[1]
                return
        super().setUpClass()
        cls.server_url = cls.live_server_url


    @classmethod
    def tearDOwnClass(cls):
        if cls.server_url == cls.server_url:
            super().tearDownClass()

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)

    def tearDown(self):
        self.browser.quit()

    def wait_for_element_with_id(self, element_id):
        WebDriverWait(self.browser, timeout=30).until(
            lambda b: b.find_element_by_id(element_id),
            'Could not find element with id {}. Page text was {}'.format(
            element_id, self.browser.find_element_by_tag_name('body').text
            )
        )

    def wait_to_be_signed_in(self, username):
        self.wait_for_element_with_id('nav-navbar-right-bar-user')
        user = self.browser.find_element_by_css_selector('#nav-navbar-right-bar-user')
        self.assertIn(username, user.text)

    def wait_to_be_signed_out(self, username):
        self.wait_for_element_with_id('navbar-collapse-right-bar-signup')
        signup = self.browser.find_element_by_css_selector('#navbar-collapse-right-bar-signup')
        self.assertNotIn(username, signup.text)


    def create_pre_authenticated_session(self, username):
        user = User.objects.create(username=username)
        session = SessionStore()
        session[SESSION_KEY] = user.pk
        session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[2]
        session.save()

        ### to set a cookie we need to first visit the domain
        ## 404 pages load the quickest
        self.browser.get(self.server_url + '/404_no_such_url/')
        self.browser.add_cookie(dict(
            name=settings.SESSION_COOKIE_NAME,
            value=session.session_key,
            path='/'
        ))