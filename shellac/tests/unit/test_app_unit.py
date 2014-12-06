from django.core.urlresolvers import reverse, resolve
from django.test import TestCase
from django.contrib.auth.models import User
from django.test.client import RequestFactory
from django.views.generic.base import TemplateView

class AppPageTest(TestCase):
    fixtures = ['shellac.json', 'auth.json']

    def setUp(self):
        username = 'jvwong'
        password = 'jvwong'
        self.user = User.objects.get(username=username)
        self.person = self.user.person
        self.client.login(username=username, password=password)
        self.factory = RequestFactory()

    def test_app_page_returns_correct_template(self):
        request = self.factory.get(reverse('shellac_app'))
        response = TemplateView.as_view(template_name="app/app.html")(request)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'app/app.html')




