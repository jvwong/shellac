from selenium import webdriver
from django.contrib.staticfiles.testing import StaticLiveServerCase
from selenium.webdriver.support.ui import WebDriverWait
import sys

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

