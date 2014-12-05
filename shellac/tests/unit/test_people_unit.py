from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.test.client import RequestFactory
from django.core.paginator import Paginator

from shellac.views.app import shellac_people
from shellac.models import Person

# """
#  BEGIN People page unit testing
# """
class PeoplePage(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)

    def test_people_url_returns_correct_url(self):
        url = reverse('shellac_people')
        self.assertEqual(url, '/app/people/')

    def test_people_page_returns_correct_html(self):
        response = self.client.get('/app/people/')

        people = Person.objects.exclude(user=self.user).order_by('-joined')
        paginator = Paginator(people, 25)
        page_obj = paginator.page(1)

        expected_html = render_to_string('shellac/app/people.html', {'user': self.user, 'page_obj': page_obj, 'paginator': paginator})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode(), expected_html)

class PeoplePageAccess(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jray'
        password = 'jray'
        self.user = User.objects.get(username=username)
        self.person = self.user.person

    def test_people_page_requires_authentication(self):
        response = self.client.get('/app/people/')
        self.assertEqual(response.status_code, 302)
