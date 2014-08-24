from django.conf import settings
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from django.test import LiveServerTestCase
from django.contrib.auth.models import User
from shellac.models import Clip
import os

import time

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

clipPath = '/home/jvwong/Projects/shellac/shellac/tests/app/aud.mp3'
brandPath = '/home/jvwong/Projects/shellac/shellac/tests/app/img.jpeg'

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


# Test NewClipTest - This test tracks the user interaction from login to adding and retrieving
# a new Clip object.
class NewClipTest(LiveServerTestCase):
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)
        self.browser.get(self.live_server_url)
        self.browser.set_window_size(1024, 768)
        self.user = User.objects.create_user(u.get('username_dummy'),
                                             u.get('email_dummy'),
                                             u.get('password_dummy'))
        login(self, u['username_dummy'], u['password_dummy'])
        #The user clicks on the "record" menu bar link and is redirected to the record page
        menu_record_anchor = self.browser.find_element_by_class_name('glyphicon-record')
        menu_record_anchor.click()
        self.assertIn('Record', self.browser.title)

    def tearDown(self):
        clips = Clip.objects.all()
        for clip in clips:
            audpath = settings.MEDIA_ROOT + clip.audio_file.name
            if os.path.isfile(audpath):
                os.remove(audpath)
            imgpath = settings.MEDIA_ROOT + clip.brand.name
            if os.path.isfile(imgpath):
                os.remove(imgpath)
        self.browser.quit()

    # def test_layout_and_styling(self):
    #     # She notices the input box is nicely centered
    #     title_input = self.browser.find_element_by_id('id_title')
    #     self.assertAlmostEqual(title_input.location['x'], 1024*(2/12), delta=50)
    #
    #     time.sleep(5)

    def test_user_can_add_a_clip_and_view_permalink(self):
        #The user is presented with a form that allows her to add a new Clip
        # including fields for title, categories, description, brand, status, audio, tags
        title_input = self.browser.find_element_by_css_selector('#id_title')
        category_input = self.browser.find_element_by_css_selector('#id_categories')
        description_input = self.browser.find_element_by_css_selector('#id_description')
        brand_input = self.browser.find_element_by_css_selector('#id_brand')
        brand_input.send_keys(brandPath)
        status_input = self.browser.find_element_by_css_selector('#id_status')
        audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
        audio_input.send_keys(clipPath)
        tags_input = self.browser.find_element_by_css_selector('#id_tags')


        #User types in fields for title
        title_input.send_keys(c['title'])
        description_input.send_keys(c['description'])
        tags_input.send_keys(c['tags'])

        #When she hits 'enter' the user is redirected to the 'profile' page

        submit_button = self.browser.find_element_by_css_selector('#record_submit')
        submit_button.send_keys(Keys.ENTER)

        #Valdiate that we're on the Permalink site and can examine the Clip details
        self.assertIn('Permalink', self.browser.title)
        title = self.browser.find_element_by_css_selector('.clip-detail-title')
        description = self.browser.find_element_by_css_selector('.clip-detail-description')
        #categories = self.browser.find_element_by_css_selector('.clip-detail-categories')
        plays = self.browser.find_element_by_css_selector('.clip-detail-plays')
        status = self.browser.find_element_by_css_selector('.clip-detail-status')
        #tags = self.browser.find_element_by_css_selector('.clip-detail-tags')

        self.assertEqual(title.text, c['title'])
        self.assertEqual(description.text, c['description'])
        self.assertEqual(plays.text, 'Plays: 0')
        self.assertEqual(status.text, 'Status: 1')

        #time.sleep(5)




