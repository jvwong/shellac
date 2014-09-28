import os
import time

from django.contrib.auth.models import User

from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest

# """
#  BEGIN Profile page testing
# """
class ProfileTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(ProfileTest, self).setUp()

        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/profile/' + username + '/')
        self.wait_to_be_signed_in(self.user.username)

    def test_profile_page_displays_correct_information(self):
        # jvwong --> jray
        # aray --> jray
        img_avatar = self.browser.find_element_by_css_selector('.content-profile .partial-profile-person .partial-profile-person-avatar')
        self.assertEqual(img_avatar.get_attribute('alt'), self.user.person.username)

        detail_list = self.browser.find_elements_by_css_selector('.content-profile .partial-profile-person .partial-profile-person-description span')
        self.assertTrue(
            any(span.text == self.user.person.username for span in detail_list)
        )
        self.assertTrue(
            any(span.text == self.user.person.joined.strftime("%b %d, %Y") for span in detail_list)
        )

    def test_profile_page_can_navigate_to_clip_app(self):
        app_link = self.browser.find_element_by_css_selector('.content-profile .partial-profile-person-app')
        #print(app_link)
        app_link.click()

        title = self.browser.find_element_by_tag_name('title')
        self.assertIn(title.text, 'App')






