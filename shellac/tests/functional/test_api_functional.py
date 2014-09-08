from shellac.tests.utils.functional import FunctionalTest, setFileAttributefromLocal
from django.contrib.auth import get_user_model
from shellac.models import Clip, Category
User = get_user_model()
import time
import os
import json
from django.conf import settings

##Fake category
c1 = {"title": "cat1 title",
      "description": "cat1 description"
}
c1_json = json.dumps(c1)

c2 = {"title": "cat2 title",
      "description": "cat2 description"
}
c2_json = json.dumps(c2)

c3 = {"title": "cat3 title",
      "description": "cat3 description"
}
c3_json = json.dumps(c3)

c4 = {"title": "cat4 title",
      "description": "cat4 description"
}
c4_json = json.dumps(c4)

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
FUNCTIONALTEST_DIR = os.path.abspath(os.path.dirname(__file__))
audio_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../assets/song.mp3")
# audio_path = os.path.abspath(os.path.join(FUNCTIONALTEST_DIR, "../assets/song.mp3"))

class ApiGetPageTest(FunctionalTest):

    def test_api_root_get_renders_DJANGOREST_html_interface_listing_categories(self):

        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url + '/')
        self.wait_to_be_signed_in(u['username_dummy'])

        #create n Category objects
        cat1 = Category.objects.create_category(title=c1['title'],
                                                description=c1['description'])
        cat2 = Category.objects.create_category(title=c2['title'],
                                                        description=c2['description'])
        cat3 = Category.objects.create_category(title=c3['title'],
                                                        description=c3['description'])
        cat4 = Category.objects.create_category(title=c4['title'],
                                                        description=c4['description'])

        categories = Category.objects.all()
        self.assertEqual(len(categories), 4)

        #reload the page
        self.browser.get(self.server_url + '/api/categories/')
        self.assertIn('Django REST framework', self.browser.title)
        span_response_headers = self.browser.find_element_by_css_selector('.meta.nocode')

        self.assertIn('HTTP 200 OK', span_response_headers.text)
        self.assertIn('Content-Type: application/json', span_response_headers.text)
        self.assertIn('Vary: Accept', span_response_headers.text)
        self.assertIn('Allow: GET, POST, HEAD, OPTIONS', span_response_headers.text)

