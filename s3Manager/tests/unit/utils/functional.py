import sys

from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, SESSION_KEY
from django.contrib.sessions.backends.db import SessionStore

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.support.ui import WebDriverWait
from django.contrib.auth.models import User

from xvfbwrapper import Xvfb
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium import webdriver


### The base class for all functional tests
class FunctionalTest(StaticLiveServerTestCase):
    #
    # @classmethod
    # def setUpClass(cls):
    #     for arg in sys.argv:
    #         if 'liveserver' in arg:
    #             cls.server_url = 'http://' + arg.split('=')[1]
    #             return
    #     super().setUpClass()
    #     cls.server_url = cls.live_server_url
    #
    #
    # @classmethod
    # def tearDownClass(cls):
    #     if cls.server_url == cls.live_server_url:
    #         super().tearDownClass()

    @classmethod
    def setUpClass(cls):
        super(FunctionalTest, cls).setUpClass()
        for arg in sys.argv:
            if 'liveserver' in arg:
                cls.server_url = 'http://' + arg.split('=')[1]
                return
        cls.xvfb = Xvfb(width=1280, height=720)
        cls.xvfb.start()
        cls.wd = WebDriver()
        cls.server_url = cls.live_server_url

    @classmethod
    def tearDownClass(cls):
        super(FunctionalTest, cls).tearDownClass()
        if cls.server_url == cls.live_server_url:
            super().tearDownClass()
        cls.wd.quit()
        cls.xvfb.stop()

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)

    def tearDown(self):
        self.browser.quit()

    def wait_for_element_with_id(self, element_id):
        WebDriverWait(self.browser, timeout=2).until(
            lambda b: b.find_element_by_id(element_id),
            'Could not find element with id {}. Page text was {}'.format(
            element_id, self.browser.find_element_by_tag_name('body').text
            )
        )

    def create_pre_authenticated_session(self, username):
        self.user = User.objects.create(username=username)
        session = SessionStore()
        session[SESSION_KEY] = self.user.pk
        session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[3]
        session.save()

        ### to set a cookie we need to first visit the domain
        ## 404 pages load the quickest
        self.browser.get(self.server_url + '/404_no_such_url/')
        self.browser.add_cookie(dict(
            name=settings.SESSION_COOKIE_NAME,
            value=session.session_key,
            path='/'
        ))

    def enable_pre_authenticated_session(self, username):
        session = SessionStore()
        session[SESSION_KEY] = self.user.pk
        session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[3]
        session.save()

        ### to set a cookie we need to first visit the domain
        ## 404 pages load the quickest
        self.browser.get(self.server_url + '/404_no_such_url/')
        self.browser.add_cookie(dict(
            name=settings.SESSION_COOKIE_NAME,
            value=session.session_key,
            path='/'
        ))