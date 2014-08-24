from django.test import LiveServerTestCase
from django.http import HttpRequest
from django.shortcuts import render
from django.template.loader import render_to_string
from shellac.models import Clip
from django.contrib.auth.models import User

def template_tag(request):
    return render(request, 'custom_tests/latest_clips.html')

def get_users():
    username1_dummy = 'andrea'
    password1_dummy = 'a'
    email1_dummy = 'aray@outlook.com'

    username2_dummy = 'jvwong'
    password2_dummy = 'j'
    email2_dummy = 'jray@outlook.com'

    user1 = User.objects.create_user(username1_dummy, password1_dummy, email1_dummy)
    user2 = User.objects.create_user(username2_dummy, password2_dummy, email2_dummy)

    users = [user1, user2]
    return users

# GET /record
class LatestClipTagTest(LiveServerTestCase):

    def setUp(self):
        self.users = get_users()

        clip_1 = Clip()
        clip_1.title = 'Title: Clip 1'
        clip_1.author = self.users[0]
        clip_1.description = 'Description: Clip 1'
        clip_1.plays = 0
        clip_1.save()

        clip_2 = Clip()
        clip_2.title = 'Title: Clip 2'
        clip_2.author = self.users[1]
        clip_2.description = 'Description: Clip 2'
        clip_2.plays = 0
        clip_2.save()


    def tearDown(self):
        pass


    def test_template_tag_returns_correct_html(self):
        request = HttpRequest()
        response = template_tag(request)
        expected_html = render_to_string('custom_tests/latest_clips.html', {'latest_clips': Clip.objects.all()})
        self.assertEqual(Clip.objects.all().count(), 2)
        self.assertEqual(response.content.decode(), expected_html)

