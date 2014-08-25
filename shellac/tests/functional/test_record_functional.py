from django.conf import settings
from selenium.webdriver.common.keys import Keys
from django.contrib.auth import BACKEND_SESSION_KEY, SESSION_KEY, get_user_model
from django.contrib.sessions.backends.db import SessionStore
from shellac.tests.utils.base import FunctionalTest
from shellac.models import Clip
import os
import sys
import time

User = get_user_model()

#file paths
CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))
CLIP_NAME = os.path.abspath(os.path.join(CURRENT_DIR, "aud.mp3"))
BRAND_NAME = os.path.abspath(os.path.join(CURRENT_DIR, "img.jpeg"))

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


# Test NewClipTest - This test tracks the user interaction from login to adding and retrieving
# a new Clip object.
class NewClipTest(FunctionalTest):

    def setUp(self):
        # #Initially on the profile page, the user clicks on the "Record" menu bar
        # # item and redirected to the 'record' page (/)
        # menu_record_anchor = self.browser.find_element_by_class_name('glyphicon-record')
        # menu_record_anchor.click()
        # self.assertIn('Record', self.browser.title)
        super(NewClipTest, self).setUp()

    def tearDown(self):
        clips = Clip.objects.all()
        for clip in clips:
            audpath = settings.MEDIA_ROOT + clip.audio_file.name
            if os.path.isfile(audpath):
                os.remove(audpath)
            imgpath = settings.MEDIA_ROOT + clip.brand.name
            if os.path.isfile(imgpath):
                os.remove(imgpath)
        super(NewClipTest, self).tearDown()

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

    def test_user_signin(self):
        self.browser.get(self.server_url)
        self.wait_to_be_signed_out(u['username_dummy'])
        time.sleep(3)

        #andrea is a logged in user
        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url)
        self.wait_to_be_signed_in(u['username_dummy'])

        time.sleep(3)




    # def test_user_can_add_a_clip_and_view_permalink(self):
    #     #The user is presented with a form that allows her to add a new Clip
    #     # including fields for title, categories, description, brand, status, audio, tags
    #     title_input = self.browser.find_element_by_css_selector('#id_title')
    #     category_input = self.browser.find_element_by_css_selector('#id_categories')
    #     description_input = self.browser.find_element_by_css_selector('#id_description')
    #     brand_input = self.browser.find_element_by_css_selector('#id_brand')
    #     brand_input.send_keys(BRAND_NAME )
    #     status_input = self.browser.find_element_by_css_selector('#id_status')
    #     audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
    #     audio_input.send_keys(CLIP_NAME)
    #     tags_input = self.browser.find_element_by_css_selector('#id_tags')
    #
    #     #User types in fields for title
    #     title_input.send_keys(c['title'])
    #     description_input.send_keys(c['description'])
    #     tags_input.send_keys(c['tags'])
    #
    #     #When she hits 'enter' the user is redirected to the 'profile' page
    #     record_button = self.browser.find_element_by_css_selector('#record_submit')
    #     record_button.send_keys(Keys.ENTER)
    #
    #     #Valdiate that we're on the Permalink site and can examine the Clip details
    #     self.assertIn('Permalink', self.browser.title)
    #     title = self.browser.find_element_by_css_selector('.clip-detail-title')
    #     description = self.browser.find_element_by_css_selector('.clip-detail-description')
    #     #categories = self.browser.find_element_by_css_selector('.clip-detail-categories')
    #     plays = self.browser.find_element_by_css_selector('.clip-detail-plays')
    #     status = self.browser.find_element_by_css_selector('.clip-detail-status')
    #     #tags = self.browser.find_element_by_css_selector('.clip-detail-tags')
    #
    #     self.assertEqual(title.text, c['title'])
    #     self.assertEqual(description.text, c['description'])
    #     self.assertEqual(plays.text, 'Plays: 0')
    #     self.assertEqual(status.text, 'Status: 1')
    #
    #     #time.sleep(5)




