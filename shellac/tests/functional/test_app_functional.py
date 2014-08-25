from django.contrib.staticfiles.testing import StaticLiveServerCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from django.contrib.auth.models import User
from shellac.models import Clip
import time
import sys

##Fake user
u = {
    'username_dummy': 'andrea',
    'password_dummy': 'a',
    'email_dummy': 'aray@outlook.com'
}
##Fake clip
c = {
    'title': 'Clip1 title',
    'description': 'Clip1 description',
    'tags': 'cool, new, stuff'
}
pgwd = 1024
pght = 768


def login(self, usernm, passwd):
    #User will be presented with a for with "username" and "password" form
    username_box = self.browser.find_element_by_id('signin_username')
    self.assertEqual(username_box.get_attribute('placeholder'), 'Username')
    password_box = self.browser.find_element_by_id('signin_password')
    self.assertEqual(password_box.get_attribute('placeholder'), 'Password')

    #User types in 'jvwong' and 'b' into username and password boxes
    username_box.send_keys(usernm)
    password_box.send_keys(passwd)

    #When she hits 'enter' the user is redirected to the 'profile' page
    submit_button = self.browser.find_element_by_id('signin_submit')
    submit_button.send_keys(Keys.ENTER)


class AppPageTest(StaticLiveServerCase):
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
        self.browser.get(self.server_url)
        self.browser.set_window_size(pgwd, pght)
        self.user = User.objects.create_user(u.get('username_dummy'),
                                             u.get('email_dummy'),
                                             u.get('password_dummy'))
        Clip.objects.create_clip('Clip1', self.user)
        Clip.objects.create_clip('Clip2', self.user)
        Clip.objects.create_clip('Clip3', self.user)
        Clip.objects.create_clip('Clip4', self.user)
        login(self, u['username_dummy'], u['password_dummy'])

        #The user clicks on the "record" menu bar link and is redirected to the record page
        menu_brand = self.browser.find_element_by_css_selector('.navbar-brand')
        menu_brand.click()
        self.assertIn('App', self.browser.title)

    def tearDown(self):
        self.browser.quit()


    def test_fake(self):
        clip_detail_anchor = self.browser.find_element_by_css_selector('.clip-detail-audio_file-anchor')
        self.assertAlmostEqual(clip_detail_anchor.location['x'], pgwd/12 * 3, delta=50)
