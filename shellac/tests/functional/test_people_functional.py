from django.contrib.auth.models import User
import time
from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest

# """
#  BEGIN People page unit testing
# """
class PeopleTest(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(PeopleTest, self).setUp()

        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/people/')
        self.wait_to_be_signed_in(self.user.username)

    def test_people_page_displays_list_of_correct_Person_profiles(self):
        #will exclude jray
        self.browser.get(self.server_url + '/people/')
        usernames = self.browser.find_elements_by_css_selector('.content-relationships.people .partial-relationships.person .partial-relationships-description-content.username')
        self.assertIn('kray', usernames[0].text)
        self.assertIn('aray', usernames[1].text)
        self.assertIn('jvwong', usernames[2].text)







