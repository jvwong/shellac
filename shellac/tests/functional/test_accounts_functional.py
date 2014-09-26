from selenium.webdriver.common.keys import Keys
from django.contrib.auth.models import User
from shellac.tests.utils.functional import FunctionalTest

##Fake user
username_dummy = 'andrea'
password_dummy = 'a'
email_dummy = 'aray@outlook.com'

class NewUserTest(FunctionalTest):
    def test_new_user_can_sign_up(self):

        # A potential user hears about a new web-app that plays audio clips from sports
        # commentators. She checks the homepage
        self.browser.get(self.server_url)

        #User is immediately re directed to the "Sign in" page.
        self.assertIn('Sign in', self.browser.title)
        brand_text = self.browser.find_element_by_class_name('navbar-brand').text

        #User is presented with an option to 'Sign up' in menu bar.
        menubar_signin_anchor = self.browser.find_element_by_id('navbar-collapse-right-bar-signup')
        menubar_signin_anchor.click()

        # She Clicks it and is redirected to the 'Sign up' page
        #time.sleep(1)
        self.assertIn('Sign up', self.browser.title)

        #She is given a form with options to enter username, email, and password fields
        main = self.browser.find_element_by_tag_name('main')
        username_box = main.find_element_by_id('signup_username')
        email_box = main.find_element_by_id('signup_email')
        password1_box = main.find_element_by_id('signup_password1')
        password2_box = main.find_element_by_id('signup_password2')

        username_box.send_keys(username_dummy)
        email_box.send_keys(email_dummy)
        password1_box.send_keys(password_dummy)
        password2_box.send_keys(password_dummy)

        #When she hits 'enter' the user is redirected to the 'profile' page
        submit_button = self.browser.find_element_by_id('signup_submit')
        submit_button.send_keys(Keys.ENTER)

        #time.sleep(1)
        self.assertIn('Profile', self.browser.title)
        #check existence of sidebar
        profile_div = self.browser.find_element_by_class_name('profile')
        profile_lis = profile_div.find_elements_by_tag_name('li')

        #check existence of profile info
        self.assertTrue(
            any(li.text == 'Login: ' + username_dummy for li in profile_lis)
        )
        self.assertTrue(
            any(li.text == 'Email: ' + email_dummy for li in profile_lis)
        )

        #She is presented with a sign out menubar cog option
        navbar_cog = self.browser.find_element_by_class_name('dropdown-toggle')
        navbar_cog.click()

        #She clicks the cog, then sign out
        navbar_dropdown_signout = self.browser.find_element_by_id('navbar-collapse-right-dropdown-signout')
        navbar_dropdown_signout.click()

        #When she signs out she is redirected to the sign in page
        self.assertIn('Sign in', self.browser.title)
        #time.sleep(2)


class DuplicateUserTest(FunctionalTest):

    def test_new_user_can_sign_up(self):

        # A potential user hears about a new web-app that plays audio clips from sports
        # commentators. She checks the homepage
        self.browser.get(self.server_url)

        self.user = User.objects.create_user(username_dummy,
                                            email_dummy,
                                            password_dummy)

        #User is immediately re directed to the "Sign in" page.
        #She notices the page title and header mentions the name SHELLAC
        self.assertIn('SHELLAC', self.browser.title)
        self.assertIn('Sign in', self.browser.title)
        brand_text = self.browser.find_element_by_class_name('navbar-brand').text
        self.assertEqual('SHELLAC', brand_text)

        #User is presented with an option to 'Sign up' in menu bar.
        menubar_signin_anchor = self.browser.find_element_by_id('navbar-collapse-right-bar-signup')
        menubar_signin_anchor.click()

        # She Clicks it and is redirected to the 'Sign up' page
        #time.sleep(1)
        self.assertIn('Sign up', self.browser.title)

        #She is given a form with options to enter username, email, and password fields
        main = self.browser.find_element_by_tag_name('main')
        username_box = main.find_element_by_id('signup_username')
        email_box = main.find_element_by_id('signup_email')
        password1_box = main.find_element_by_id('signup_password1')
        password2_box = main.find_element_by_id('signup_password2')

        username_box.send_keys(username_dummy)
        email_box.send_keys(email_dummy)
        password1_box.send_keys(password_dummy)
        password2_box.send_keys(password_dummy)

        #When she hits 'enter' the user is redirected back to the 'sign up' page
        submit_button = self.browser.find_element_by_id('signup_submit')
        submit_button.send_keys(Keys.ENTER)
        self.assertIn('Sign up', self.browser.title)

        # The user notices an error message
        help_block = self.browser.find_element_by_class_name('help-block')

        #check existence of profile info
        self.assertEqual(help_block.text, 'A user with that username already exists.')
        #time.sleep(1)


class ReturningUserTest(FunctionalTest):

    def test_returning_user_can_sign_in(self):

        # A user wants to return to the web-app that plays audio clips.
        # She checks into the homepage
        self.browser.get(self.server_url)

        self.user = User.objects.create_user(username_dummy,
                                            email_dummy,
                                            password_dummy)

        #User is immediately re directed to the "Sign in" page
        #He notices the page title and header mentions the name SHELLAC
        self.assertIn('Sign in', self.browser.title)
        brand_text = self.browser.find_element_by_class_name('navbar-brand').text

        #User will be presented with a for with "username" and "password" form
        username_box = self.browser.find_element_by_id('signin_username')
        self.assertEqual(username_box.get_attribute('placeholder'), 'Username')
        password_box = self.browser.find_element_by_id('signin_password')
        self.assertEqual(password_box.get_attribute('placeholder'), 'Password')

        #User types in 'jvwong' and 'b' into username and password boxes
        username_box.send_keys(username_dummy)
        password_box.send_keys(password_dummy)

        #When she hits 'enter' the user is redirected to the 'profile' page
        submit_button = self.browser.find_element_by_id('signin_submit')
        submit_button.send_keys(Keys.ENTER)
        self.assertIn('App', self.browser.title)
        #time.sleep(1)
