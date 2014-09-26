import os
#!/usr/bin/python
import time

from django.contrib.auth.models import User

from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest

# """
#  BEGIN Tune page unit testing
# """
class TuneFollowers(FunctionalTest):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        super(TuneFollowers, self).setUp()

        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.enable_pre_authenticated_session(self.user.username)
        self.browser.get(self.server_url + '/tune/')
        self.wait_to_be_signed_in(self.user.username)

    def test_tune_page_displays_list_of_correct_relationships(self):
        # jvwong --> jray
        # aray --> jray
        lis_following = self.browser.find_elements_by_css_selector('.content-tune-following li')
        self.assertIn('jvwong', lis_following[0].text)
        self.assertIn('kray', lis_following[1].text)

        lis_following = self.browser.find_elements_by_css_selector('.content-tune-followers li')
        self.assertIn('jvwong', lis_following[0].text)
        self.assertIn('aray', lis_following[1].text)

        lis_following = self.browser.find_elements_by_css_selector('.content-tune-friends li')
        self.assertIn('jvwong', lis_following[0].text)





