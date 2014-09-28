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
        #Select the anchor headings
        title_anchors = self.browser.find_elements_by_css_selector('.panel-title-link')

        following_spans = self.browser.find_elements_by_css_selector('.content-tune-relationship.following span')
        self.assertTrue(any(span.text == 'jvwong' for span in following_spans))
        self.assertTrue(any(span.text == 'kray' for span in following_spans))

        #These are not visible at the time of presentation
        title_anchors[1].click()
        followers_spans = self.browser.find_elements_by_css_selector('.content-tune-relationship.followers span')
        self.assertTrue(any(span.text == 'jvwong' for span in followers_spans))
        self.assertTrue(any(span.text == 'aray' for span in followers_spans))

        title_anchors[2].click()
        friends_spans = self.browser.find_elements_by_css_selector('.content-tune-relationship.friends span')
        self.assertTrue(any(span.text == 'jvwong' for span in friends_spans))



