# from shellac.tests.utils.base import FunctionalTest, setFileAttributefromLocal
# from django.contrib.auth import get_user_model
# from shellac.models import Clip, Category
# User = get_user_model()
# import time
# import os
# from django.conf import settings
#
# ##Fake user
# u = {
#     'username_dummy': 'andrea',
#     'password_dummy': 'a',
#     'email_dummy': 'aray@outlook.com'
# }
# ##Fake clip
# c = {
#     'title': 'Clip1 title',
#     'description': 'Clip1 description',
#     'tags': 'cool, new, stuff'
# }
# FUNCTIONALTEST_DIR = os.path.abspath(os.path.dirname(__file__))
# audio_path = os.path.abspath(os.path.join(FUNCTIONALTEST_DIR, "../assets/song.mp3"))

# class AppPageTest(FunctionalTest):

    # def test_app_page_renders_latest_content(self):
    #
    #     self.create_pre_authenticated_session(u['username_dummy'])
    #     self.browser.get(self.server_url + '/')
    #     self.wait_to_be_signed_in(u['username_dummy'])
    #
    #     #create n Clip objects
    #     c1 = Clip.objects.create_clip('Clip1', self.user)
    #     setFileAttributefromLocal(c1.audio_file, audio_path, "")
    #     c2 = Clip.objects.create_clip('Clip2', self.user)
    #     setFileAttributefromLocal(c2.audio_file, audio_path, "")
    #     c3 = Clip.objects.create_clip('Clip3', self.user)
    #     setFileAttributefromLocal(c3.audio_file, audio_path, "")
    #     c4 = Clip.objects.create_clip('Clip4', self.user)
    #     setFileAttributefromLocal(c4.audio_file, audio_path, "")
    #
    #     clips = Clip.objects.all()
    #     self.assertEqual(len(clips), 4)
    #
    #     #reload the page
    #     self.browser.get(self.server_url + '/')
    #     app = self.browser.find_element_by_id('shellac-app')
    #
    #     #ensure n clips exist
    #     clips = app.find_elements_by_css_selector('.media.clip')
    #     self.assertEqual(len(clips), 4)
    #
    #     img_anchors = clips[0].find_elements_by_tag_name('a')
    #     img_anchors[0].click()
    #
    #     self.assertIn('Permalink', self.browser.title)


    # def test_app_page_renders_latest_categories(self):
    #
    #     self.create_pre_authenticated_session(u['username_dummy'])
    #     self.browser.get(self.server_url + '/')
    #     self.wait_to_be_signed_in(u['username_dummy'])
    #
    #     #autopopulate with categories
    #     Category.objects.autopopulate()
    #     categories = Category.objects.all()
    #     numCat = len(categories)
    #     self.assertEqual(len(categories), numCat)
    #
    #     #create n Clip objects
    #     c1 = Clip.objects.create_clip('Clip1', self.user)
    #     setFileAttributefromLocal(c1.audio_file, audio_path, "")
    #     c1.categories = [Category.objects.filter(title__icontains="MUSIC").get()]
    #     c1.save()
    #
    #     c2 = Clip.objects.create_clip('Clip2', self.user)
    #     setFileAttributefromLocal(c2.audio_file, audio_path, "")
    #     c2.categories = [Category.objects.filter(title__icontains="POLITICS").get()]
    #     c2.save()
    #
    #     c3 = Clip.objects.create_clip('Clip3', self.user)
    #     setFileAttributefromLocal(c3.audio_file, audio_path, "")
    #     c3.categories = [Category.objects.filter(title__icontains="TECHNOLOGY").get()]
    #     c3.save()
    #
    #     c4 = Clip.objects.create_clip('Clip4', self.user)
    #     setFileAttributefromLocal(c4.audio_file, audio_path, "")
    #     c4.categories = [Category.objects.filter(title__icontains="HEALTH").get()]
    #     c4.save()
    #
    #     clips = Clip.objects.all()
    #     self.assertEqual(len(clips), 4)
    #
    #     #reload the page
    #     self.browser.get(self.server_url + '/')
    #
    #     #find the sidebar
    #     catlist = self.browser.find_element_by_class_name('nav-sidebar')
    #     catlis = catlist.find_elements_by_css_selector('.nav-sidebar-category')
    #
    #     #the category sidebar should show numCat categories
    #     self.assertEqual(len(catlis), numCat)
    #
    #     #clicking on one of the category sidebar elements should reload
    #     # only those in the category
    #     catlis[0].click()
    #     mediadivs = self.browser.find_elements_by_class_name('media')
    #     self.assertEqual(len(mediadivs), 1)
    #
    #     time.sleep(10)
    #
    #
