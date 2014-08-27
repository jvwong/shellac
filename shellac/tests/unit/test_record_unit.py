from django.core.urlresolvers import resolve
from django.test import TestCase
from django.http import HttpRequest, QueryDict, HttpResponsePermanentRedirect
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from shellac.views.app import shellac_record
from django.contrib.auth.decorators import login_required
from shellac.forms import RecordForm
import datetime
from time import strftime

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
class RecordPageTest(TestCase):
    def test_record_url_resolves_to_record_page_view(self):
        found = resolve('/clips/record/')
        self.assertEqual(found.func, shellac_record)

    def test_record_page_returns_correct_html(self):
        self.user = User.objects.create_user(username_dummy,
                                            email_dummy,
                                            password_dummy)
        request = HttpRequest()
        request.user = self.user
        response = shellac_record(request)
        form = RecordForm()
        expected_html = render_to_string('shellac/record.html', {'form': form, 'user': self.user})
        self.assertEqual(response.content.decode(), expected_html)

