# import time
#
# from django.contrib.auth.models import User
#
# from selenium.webdriver.common.keys import Keys
# from shellac.tests.utils.functional import FunctionalTest
#
# # """
# #  BEGIN Relations page unit testing
# # """
# class RelationsTest(FunctionalTest):
#     fixtures = ['shellac.json', 'auth.json']
#
#     def setUp(self):
#         super(RelationsTest, self).setUp()
#
#         username = 'jray'
#         password = 'jray'
#         self.user = User.objects.get(username=username)
#         self.person = self.user.person
#         self.enable_pre_authenticated_session(self.user.username)
#         self.browser.get(self.server_url + '/app/relations/')
#         self.wait_to_be_signed_in(self.user.username)
#
#     def test_relations_page_displays_list_of_correct_relationships(self):
#         # jvwong --> jray
#         # aray --> jray
#         #Select the anchor headings
#         title_anchors = self.browser.find_elements_by_css_selector('.panel-title-link')
#
#         following_spans = self.browser.find_elements_by_css_selector('.following .partial-relationships-description .mls')
#         self.assertTrue(any(span.text == 'jvwong' for span in following_spans))
#         self.assertTrue(any(span.text == 'kray' for span in following_spans))
#
#         #These are not visible at the time of presentation
#         title_anchors[1].click()
#         time.sleep(0.5)
#         followers_spans = self.browser.find_elements_by_css_selector('.followers .partial-relationships-description .mls')
#         self.assertTrue(any(span.text == 'jvwong' for span in followers_spans))
#         self.assertTrue(any(span.text == 'aray' for span in followers_spans))
#
#
#
