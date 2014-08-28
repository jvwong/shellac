from django.test import TestCase
from django.http import HttpRequest
from django.shortcuts import render
from django.template.loader import render_to_string
from shellac.models import Clip
from django.contrib.auth.models import User
import sys
from shellac.tests.utils.base import cleanClips
from django.contrib.auth import get_user_model
User = get_user_model()

def template_tag(request):
    return render(request, 'shellac/custom_tests/latest_clips.html')

# GET /record
class LatestClipTagTest(TestCase):

    def test_template_tag_returns_correct_html(self):
        user1 = User.objects.create(username='jeff')
        user2 = User.objects.create(username='and')

        clip1 = Clip.objects.create_clip(title="clip1", author=user1)
        clip2 = Clip.objects.create_clip(title="clip2", author=user2)

        request = HttpRequest()
        response = template_tag(request)
        expected_html = render_to_string('shellac/custom_tests/latest_clips.html', {'latest_clips': Clip.objects.all()})
        self.assertEqual(Clip.objects.all().count(), 2)
        self.assertEqual(response.content.decode(), expected_html)
        cleanClips()

