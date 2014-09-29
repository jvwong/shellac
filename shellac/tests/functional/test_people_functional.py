from django.contrib.auth.models import User

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
        usernames = self.browser.find_elements_by_css_selector('.content-people .partial-relationships.person .partial-relationships-description-content.username')
        self.assertIn('kray', usernames[0].text)
        self.assertIn('aray', usernames[1].text)
        self.assertIn('jvwong', usernames[2].text)

    def test_People_user_can_unfollow_following(self):
        #jray will unfollow kray
        self.browser.get(self.server_url + '/people/')
        relationships_buttons = self.browser.find_elements_by_css_selector('.content-people .partial-relationships.person button')
        kray_button = relationships_buttons[0] #Following
        #aray_button = relationships_buttons[1] #Follower
        #jvwong_button = relationships_buttons[2] #friend

        self.assertEqual(kray_button.text, 'Unfollow')
        print(kray_button.text)
        ##Unfollow kray
        kray_button.click()

        print(kray_button.text)
        self.assertEqual(kray_button.text, 'Follow')


    def test_People_user_can_unfollow_friend(self):
        #jray will unfollow jvwong
        self.browser.get(self.server_url + '/people/')
        relationships_buttons = self.browser.find_elements_by_css_selector('.content-people .partial-relationships.person button')
        #kray_button = relationships_buttons[0] #Following
        #aray_button = relationships_buttons[1] #Follower
        jvwong_button = relationships_buttons[2] #friend

        self.assertEqual(jvwong_button.text, 'Unfollow')
        ##Unfollow jvwong
        jvwong_button.click()
        self.assertEqual(jvwong_button.text, 'Block')

    def test_People_user_can_block_follower(self):
        #jray will block aray
        self.browser.get(self.server_url + '/people/')
        relationships_buttons = self.browser.find_elements_by_css_selector('.content-people .partial-relationships.person button')
        #kray_button = relationships_buttons[0] #Following
        aray_button = relationships_buttons[1] #Follower
        #jvwong_button = relationships_buttons[2] #friend

        self.assertEqual(aray_button.text, 'Follow')
        ##Block aray
        aray_button.click()
        self.assertEqual(aray_button.text, 'Block')





