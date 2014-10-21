import time

from django.contrib.auth.models import User
from selenium.webdriver.common.keys import Keys

from shellac.tests.utils.functional import FunctionalTest
from shellac.models import Clip

# """
#  BEGIN My Clips testing
# """
class ClipListTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(ClipListTest, self).setUp()
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/clips/list/')
        self.wait_to_be_signed_in(self.user.username)
        self.myClips = Clip.objects.filter(author=self.person)

    def test_myClips_page_displays_aClip_in_list_of_Clips(self):
        details = self.browser.find_elements_by_css_selector('.clip-detail-container .clip-detail-description dd')
        aClip = self.myClips[0]

        self.assertTrue(
            any(dd.text == aClip.title for dd in details)
        )
        self.assertTrue(
            any(dd.text == aClip.author.username for dd in details)
        )
        self.assertTrue(
            any(dd.text == aClip.description for dd in details)
        )
        self.assertTrue(
            any(dd.text == str(aClip.plays) for dd in details)
        )
        self.assertTrue(
            any(dd.text == str(aClip.rating) for dd in details)
        )
        self.assertTrue(
            any(dd.text == str(aClip.status) for dd in details)
        )


class ClipUpdateTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(ClipUpdateTest, self).setUp()
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/clips/list/')
        self.wait_to_be_signed_in(self.user.username)
        self.myClips = Clip.objects.filter(author=self.person)

    def test_myClips_page_shows_update_option(self):
        update_button = self.browser.find_element_by_css_selector('.clip-detail-container .clip-detail-edit .update')
        update_button.click()
        labels = self.browser.find_elements_by_tag_name('label')
        self.assertTrue(
            any(text.text == 'Title:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Categories:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Description:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Brand:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Status:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Created:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Audio file:' for text in labels)
        )
        self.assertTrue(
            any(text.text == 'Tags:' for text in labels)
        )


    def test_myClips_update_changes_clip(self):
        update_button = self.browser.find_element_by_css_selector('.clip-detail-container .clip-detail-edit .update')
        update_button.click()


        title_textfield = self.browser.find_element_by_id('id_title')
        description_textfield = self.browser.find_element_by_id('id_description')

        title_textfield.clear()
        description_textfield.clear()

        title_textfield.send_keys('updated_title')
        description_textfield.send_keys('updated_description')

        submit_button = self.browser.find_element_by_id('update_submit')
        submit_button.send_keys(Keys.ENTER)

        #The user gets redirected to the permalink page
        details = self.browser.find_elements_by_css_selector('.clip-detail-container .clip-detail-description dd')
        self.assertTrue(
            any(dd.text == 'updated_title' for dd in details)
        )
        self.assertTrue(
            any(dd.text == 'updated_description' for dd in details)
        )


class ClipDeleteTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(ClipDeleteTest, self).setUp()
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.userid = str(self.user.id)
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/clips/list/')
        self.wait_to_be_signed_in(self.user.username)
        self.myClips = Clip.objects.filter(author=self.person)

    def test_myClips_page_shows_delete_confirmation(self):
        delete_button = self.browser.find_element_by_css_selector('.clip-detail-container .clip-detail-edit .delete')
        delete_button.click()

        delete_message = self.browser.find_element_by_css_selector('.form-group .confirm-delete-message')
        self.assertIn("Confirm delete", delete_message.text)

    def test_myClips_delete_removes_clip(self):
        delete_button = self.browser.find_element_by_css_selector('.clip-detail-container .clip-detail-edit .delete')
        delete_button.click()
        confirm_button = self.browser.find_element_by_id('confirm_delete')
        confirm_button.click()

        self.assertTrue(Clip.objects.filter(author=self.person).count() < len(self.myClips))
