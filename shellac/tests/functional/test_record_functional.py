from django.conf import settings
from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.base import FunctionalTest
from shellac.models import Clip
import os
import sys
import time

#file paths
FUNCTIONAL_DIR = os.path.abspath(os.path.dirname(__file__))
ASSETS_DIR = os.path.abspath(os.path.join(FUNCTIONAL_DIR, "../assets"))
CLIP_NAME = settings.STATIC_ROOT + "/shellac/assets/song.mp3"
BRAND_NAME = settings.STATIC_ROOT + "/shellac/assets/seventyEight.png"

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

    def tearDown(self):
        clips = Clip.objects.all()
        for clip in clips:
            audpath = os.path.abspath(os.path.join(settings.MEDIA_ROOT, clip.audio_file.name))
            if os.path.exists(audpath):
                os.remove(audpath)
            imgpath = os.path.abspath(os.path.join(settings.MEDIA_ROOT, clip.brand.name))
            if os.path.exists(imgpath):
                os.remove(imgpath)
        super(NewClipTest, self).tearDown()

    def test_user_can_add_a_clip_and_view_permalink(self):
        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url + '/clips/record')
        self.wait_to_be_signed_in(u['username_dummy'])

        #The user is presented with a form that allows her to add a new Clip
        # including fields for title, categories, description, brand, status, audio, tags
        title_input = self.browser.find_element_by_css_selector('#id_title')
        category_input = self.browser.find_element_by_css_selector('#id_categories')
        description_input = self.browser.find_element_by_css_selector('#id_description')
        brand_input = self.browser.find_element_by_css_selector('#id_brand')
        brand_input.send_keys(BRAND_NAME)
        status_input = self.browser.find_element_by_css_selector('#id_status')
        audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
        audio_input.send_keys(CLIP_NAME)
        tags_input = self.browser.find_element_by_css_selector('#id_tags')

        #User types in fields for title
        title_input.send_keys(c['title'])
        description_input.send_keys(c['description'])
        tags_input.send_keys(c['tags'])

        #When she hits 'enter' the user is redirected to the 'profile' page
        record_button = self.browser.find_element_by_css_selector('#record_submit')
        record_button.send_keys(Keys.ENTER)

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
