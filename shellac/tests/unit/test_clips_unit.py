from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.clips import shellac_clips_create
from shellac.forms import RecordForm

##Fake user
username_dummy = 'andrea'
password_dummy = 'a'
email_dummy = 'aray@outlook.com'

c = {
    'title': 'clip1 title',
    'description': 'clip1 description',
    'plays': 0,
    'rating': 0,
    'status': 1
}

# GET /record
class CreatePageTest(TestCase):
    def test_create_url_resolves_to_create_page_view(self):
        found = resolve('/clips/create/')
        self.assertEqual(found.func, shellac_clips_create)

    def test_record_page_returns_correct_html(self):
        self.user = User.objects.create_user(username_dummy,
                                            email_dummy,
                                            password_dummy)
        request = HttpRequest()
        request.user = self.user
        response = shellac_clips_create(request)
        form = RecordForm()
        expected_html = render_to_string('shellac/clips/create.html', {'form': form, 'user': self.user})
        self.assertEqual(response.content.decode(), expected_html)

