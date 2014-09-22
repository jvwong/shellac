from selenium.webdriver.common.keys import Keys
from shellac.tests.utils.functional import FunctionalTest
from shellac.models import Clip, Category
import os


#file paths
FUNCTIONAL_DIR = os.path.abspath(os.path.dirname(__file__))
ASSETS_DIR = os.path.abspath(os.path.join(FUNCTIONAL_DIR, "../assets"))
CLIP_NAME = os.path.abspath(os.path.join(ASSETS_DIR, "song.mp3"))
BRAND_NAME = os.path.abspath(os.path.join(ASSETS_DIR, "seventyEight.png"))

##Fake user
u = {
    'username_dummy': 'andrea',
    'password_dummy': 'a',
    'email_dummy': 'aray@outlook.com'
}

##Fake clip
c = {
    'title': 'Clip1 title',
    'description': 'Clip1 description',
    'tags': 'cool, new, stuff'
}


# Test NewClipTest - This test tracks the user interaction from login to adding and retrieving
# a new Clip object.
class NewClipTest(FunctionalTest):

    def tearDown(self):
        for clip in Clip.objects.all():
            clip.delete(False)
        super(NewClipTest, self).tearDown()

    def test_user_can_add_a_clip_and_view_permalink(self):
        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url + '/clips/create')
        self.wait_to_be_signed_in(u['username_dummy'])

        #The user is presented with a form that allows her to add a new Clip
        # including fields for title, categories, description, brand, status, audio, tags
        title_input = self.browser.find_element_by_css_selector('#id_title')
        category_input = self.browser.find_element_by_css_selector('#id_categories')
        description_input = self.browser.find_element_by_css_selector('#id_description')
        brand_input = self.browser.find_element_by_css_selector('#id_brand')
        #brand_input.send_keys(BRAND_NAME)
        status_input = self.browser.find_element_by_css_selector('#id_status')
        audio_input = self.browser.find_element_by_css_selector('#id_audio_file')
        audio_input.send_keys(CLIP_NAME)
        tags_input = self.browser.find_element_by_css_selector('#id_tags')

        #User types in fields for title
        title_input.send_keys(c['title'])
        description_input.send_keys(c['description'])
        tags_input.send_keys(c['tags'])

        #When she hits 'enter' the user is redirected to the 'profile' page
        record_button = self.browser.find_element_by_css_selector('#record_submit')
        record_button.send_keys(Keys.ENTER)

        #Valdiate that we're on the Permalink site and can examine the Clip details
        self.assertIn('Permalink', self.browser.title)
        descriptors = self.browser.find_elements_by_css_selector(".media-description-content")

        self.assertEqual(descriptors[0].text, c['title'])
        self.assertIn(c['description'], descriptors[1].text)
        self.assertIn(u['username_dummy'], descriptors[2].text)


    def test_clips_retrieved_via_categorys_clip_set(self):
        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url + '/')
        self.wait_to_be_signed_in(u['username_dummy'])

        #Add a clip and category and retrieve the original clip
        #autopopulate with categories
        Category.objects.autopopulate()
        categories = Category.objects.all()
        numCat = len(categories)
        self.assertEqual(len(categories), numCat)

        #create n Clip objects
        c1 = Clip.objects.create_clip('Clip1', self.user.person)
        c1.categories = [Category.objects.filter(title__icontains="MUSIC").get()]
        c1.save()

        c2 = Clip.objects.create_clip('Clip2', self.user.person)
        c2.categories = [Category.objects.filter(title__icontains="MUSIC").get()]
        c2.save()

        music_category = Category.objects.filter(title="MUSIC")[0]
        music_clips = music_category.clips.all()
        #
        clipTitleList = [m.title for m in music_clips]
        self.assertTrue(len(clipTitleList), 2)
        self.assertEqual(clipTitleList[0], 'Clip1')
        self.assertEqual(clipTitleList[1], 'Clip2')

