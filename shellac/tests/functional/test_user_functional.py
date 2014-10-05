from django.contrib.auth.models import User
import time
from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest

# """
#  BEGIN User page unit testing
# """
class UserTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(UserTest, self).setUp()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/user/' + str(self.userid) + '/')
        self.wait_to_be_signed_in(self.user.username)

    def test_User_page_displays_list_of_correct_User_information(self):
        details = self.browser.find_elements_by_css_selector('.content-user .content-user-detail dd')
        self.assertTrue(
            any(dd.text == self.user.username for dd in details)
        )
        self.assertTrue(
            any(dd.text == self.user.email for dd in details)
        )
        self.assertTrue(
            any(dd.text == self.user.first_name for dd in details)
        )
        self.assertTrue(
            any(dd.text == self.user.last_name for dd in details)
        )

    def test_User_page_click_update_redirects_to_update_page(self):
        update_button = self.browser.find_element_by_css_selector('.content-user .content-user-detail .content-user-detail-button.update')
        update_button.click()
        labels = self.browser.find_elements_by_tag_name('label')
        self.assertTrue(
            any(text.text == 'Username:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'First name:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Last name:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Email address:' for text in labels)
        )











