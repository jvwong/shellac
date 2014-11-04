import os
import time

from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest
from shellac.tests.utils.unit import cleanClips
from shellac.models import Clip, Category

from django.contrib.auth.models import User


#file paths
FUNCTIONAL_DIR = os.path.abspath(os.path.dirname(__file__))
ASSETS_DIR = os.path.abspath(os.path.join(FUNCTIONAL_DIR, "../assets"))
CLIP_NAME = os.path.abspath(os.path.join(ASSETS_DIR, "song.mp3"))
INVALID_CLIP_NAME = os.path.abspath(os.path.join(ASSETS_DIR, "song_invalid.3gpp"))
BRAND_NAME = os.path.abspath(os.path.join(ASSETS_DIR, "seventyEight.png"))

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
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(NewClipTest, self).setUp()
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/clips/create/')
        self.wait_to_be_signed_in(self.user.username)

    def test_Contributor_or_staff_can_add_a_clip_and_view_permalink(self):
        #The user is presented with a form that allows her to add a new Clip
        # including fields for title, categories, description, brand, status, audio, tags
        title_input = self.browser.find_element_by_css_selector('#id_title')
        category_input = self.browser.find_element_by_css_selector('#id_categories')
        description_input = self.browser.find_element_by_css_selector('#id_description')
        brand_input = self.browser.find_element_by_css_selector('#id_brand')
        #brand_input.send_keys(BRAND_NAME)
        audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
        audio_input.send_keys(CLIP_NAME)
        tags_input = self.browser.find_element_by_css_selector('#id_tags')

        #User types in fields for title
        title_input.send_keys(c['title'])
        description_input.send_keys(c['description'])
        tags_input.send_keys(c['tags'])

        #time.sleep(3)

        #When she hits 'enter' the user is redirected to the 'profile' page
        record_button = self.browser.find_element_by_css_selector('#record_submit')
        record_button.send_keys(Keys.ENTER)

        #Valdiate that we're on the Permalink site and can examine the Clip details
        self.assertIn('Permalink', self.browser.title)

        meta = self.browser.find_elements_by_css_selector(".clip-detail-meta dd")
        self.assertTrue(
            any(dd.text == c['title'] for dd in meta)
        )
        self.assertTrue(
            any(dd.text == self.user.username for dd in meta)
        )

        description = self.browser.find_elements_by_css_selector(".clip-detail-description p")
        self.assertTrue(
            any(p.text == c['description'] for p in description)
        )

        cleanClips()

    def test_Contributor_or_staff_cannot_add_invalid_audio_type(self):
        #The user is presented with a form that allows her to add a new Clip
        # including fields for title, categories, description, brand, status, audio, tags
        title_input = self.browser.find_element_by_css_selector('#id_title')
        category_input = self.browser.find_element_by_css_selector('#id_categories')
        description_input = self.browser.find_element_by_css_selector('#id_description')
        brand_input = self.browser.find_element_by_css_selector('#id_brand')
        #brand_input.send_keys(BRAND_NAME)
        status_input = self.browser.find_element_by_css_selector('#id_status')
        audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
        audio_input.send_keys(INVALID_CLIP_NAME)
        tags_input = self.browser.find_element_by_css_selector('#id_tags')

        #User types in fields for title
        title_input.send_keys(c['title'])
        description_input.send_keys(c['description'])
        tags_input.send_keys(c['tags'])

        #When she hits 'enter' the user is not redirected
        record_button = self.browser.find_element_by_css_selector('#record_submit')
        record_button.send_keys(Keys.ENTER)

        #Valdiate that we're still on the Record page
        self.assertIn('Record', self.browser.title)
        #time.sleep(3)
        cleanClips()



class NewClipTest_Listener(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(NewClipTest_Listener, self).setUp()
        username = 'aray'
        password = 'aray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/clips/list/')
        self.wait_to_be_signed_in(self.user.username)

    def test_Listener_cannot_add_a_clip(self):
        #When she hits 'record' icon the user gets a forbidden
        record_icon = self.browser.find_element_by_css_selector('#nav-navbar-right-bar-record a')
        record_icon.send_keys(Keys.ENTER)
        self.assertIn('403 Error', self.browser.title)

    def test_Listener_cannot_change_a_clip(self):
        #When she hits 'record' icon the user gets a forbidden
        update_button = self.browser.find_element_by_css_selector('.btn.btn-default.update')
        update_button.send_keys(Keys.ENTER)
        self.assertIn('403 Error', self.browser.title)

    def test_Listener_cannot_delete_a_clip(self):
        #When she hits 'record' icon the user gets a forbidden
        del_button = self.browser.find_element_by_css_selector('.btn.btn-default.delete')
        del_button .send_keys(Keys.ENTER)
        self.assertIn('403 Error', self.browser.title)