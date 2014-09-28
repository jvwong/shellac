from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.test.client import RequestFactory
from shellac.views.app import PersonListView
from shellac.models import Person
# """
#  BEGIN People page unit testing
# """
class PeoplePage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        self.factory = RequestFactory()
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_people_url_returns_correct_url(self):
        url = reverse('shellac_person_list')
        self.assertEqual(url, '/people/')

    def test_people_page_returns_correct_html(self):
        request = self.factory.get('/people/')
        response = PersonListView.as_view()(request)
        expected_html = render_to_string('shellac/app/people.html', {'object_list': Person.objects.all().order_by('-joined')})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.rendered_content, expected_html)
