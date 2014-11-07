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

    def test_profile_page_displays_correct_Person_details(self):
        # jvwong --> jray
        # aray --> jray
        img_avatar = self.browser.find_element_by_css_selector('.content-profile .partial-profile .partial-profile-avatar .partial-profile-avatar-img_panel .partial-profile-avatar-img_panel-input_panel img')
        self.assertEqual(img_avatar.get_attribute('alt'), self.user.person.username)

        detail_list = self.browser.find_elements_by_css_selector('.content-profile .partial-profile .partial-profile-description .partial-profile-description-content')
        # print(detail_list[0].text)
        #print(self.user.person.joined.strftime("%b %d, %Y"))
        # self.assertTrue(
        #     any(dd.text == self.user.person.username for dd in detail_list)
        # )
        self.assertTrue(
            any(dd.text == self.user.person.joined.strftime("%b %d, %Y") for dd in detail_list)
        )

    def test_profile_page_can_navigate_to_clip_app(self):
        app_link = self.browser.find_element_by_css_selector('.content-profile .partial-profile .partial-profile-avatar-app_panel a')
        app_link.click()
        title = self.browser.find_element_by_tag_name('title')
        self.assertIn(title.text, 'App')

    def test_profile_page_same_user_can_edit_avatar(self):
        button_select_image = self.browser.find_element_by_css_selector('.content-profile .partial-profile .partial-profile-avatar .partial-profile-avatar-img_panel button.update')
        self.assertIn(button_select_image.text, 'Save')