from django.contrib.auth.models import User
import time
from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest

# """
#  BEGIN User page unit testing
# """
class UserDetailsTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(UserDetailsTest, self).setUp()
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

    def test_User_page_click_password_change_redirects_to_passwordchange_page(self):
        password_button = self.browser.find_element_by_css_selector('.content-user .content-user-detail .content-user-detail-button.password')
        password_button.click()
        labels = self.browser.find_elements_by_tag_name('label')
        self.assertTrue(
            any(text.text == 'Old password:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'New password:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'New password confirmation:' for text in labels)
        )


class UserUpdateTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(UserUpdateTest, self).setUp()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/user/' + str(self.userid) + '/update/')
        self.wait_to_be_signed_in(self.user.username)

    def test_UserUpdate_page_updates_User_information(self):
        username_textfield = self.browser.find_element_by_id('id_username')
        fname_textfield = self.browser.find_element_by_id('id_first_name')
        lname_textfield = self.browser.find_element_by_id('id_last_name')
        email_textfield = self.browser.find_element_by_id('id_email')

        username_textfield.clear()
        fname_textfield.clear()
        lname_textfield.clear()
        email_textfield.clear()

        username_textfield.send_keys('updated_username')
        fname_textfield.send_keys('updated_fname')
        lname_textfield.send_keys('updated_lname')
        email_textfield.send_keys('updated_email@fake.com')

        update_button = self.browser.find_element_by_css_selector('.content-user .content-user-update button')
        update_button.send_keys(Keys.ENTER)


        #The user gets redirected to the details page
        details = self.browser.find_elements_by_css_selector('.content-user .content-user-detail dd')
        self.assertTrue(
            any(dd.text == 'updated_username' for dd in details)
        )
        self.assertTrue(
            any(dd.text == 'updated_fname' for dd in details)
        )
        self.assertTrue(
            any(dd.text == 'updated_lname' for dd in details)
        )
        self.assertTrue(
            any(dd.text == 'updated_email@fake.com' for dd in details)
        )


class UserPassswordChangeTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(UserPassswordChangeTest, self).setUp()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/user/password_change/')
        self.wait_to_be_signed_in(self.user.username)

    def test_UserPassswordChange_page_updates_with_valid_password(self):
        oldpass_textfield = self.browser.find_element_by_id('id_old_password')
        newpass1_textfield = self.browser.find_element_by_id('id_new_password1')
        newpass2_textfield = self.browser.find_element_by_id('id_new_password2')

        oldpass_textfield.clear()
        newpass1_textfield.clear()
        newpass2_textfield.clear()

        oldpass_textfield.send_keys('jray')
        newpass1_textfield.send_keys('jray_updated')
        newpass2_textfield.send_keys('jray_updated')

        change_button = self.browser.find_element_by_css_selector('.content-user .content-user-password_change .btn')
        change_button.send_keys(Keys.ENTER)

        #The user gets redirected to the details page
        details = self.browser.find_elements_by_css_selector('.content-user .content-user-detail dd')
        self.assertTrue(
            any(dd.text == 'jray' for dd in details)
        )

    def test_UserPassswordChange_page_rejects_with_invalid_password(self):
        oldpass_textfield = self.browser.find_element_by_id('id_old_password')
        newpass1_textfield = self.browser.find_element_by_id('id_new_password1')
        newpass2_textfield = self.browser.find_element_by_id('id_new_password2')

        oldpass_textfield.clear()
        newpass1_textfield.clear()
        newpass2_textfield.clear()

        oldpass_textfield.send_keys('jray_bad')
        newpass1_textfield.send_keys('jray_updated')
        newpass2_textfield.send_keys('jray_updated')

        change_button = self.browser.find_element_by_css_selector('.content-user .content-user-password_change .btn')
        change_button.send_keys(Keys.ENTER)

        #The user gets errors
        errorlist_lis = self.browser.find_elements_by_css_selector('.errorlist li')

        #check existence of profile info
        self.assertTrue(
            any(li.text == 'Your old password was entered incorrectly. Please enter it again.' for li in errorlist_lis)
        )













