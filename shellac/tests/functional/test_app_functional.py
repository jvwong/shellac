from shellac.tests.utils.base import FunctionalTest
from django.contrib.auth import get_user_model
from shellac.models import Clip
User = get_user_model()
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


class AppPageTest(FunctionalTest):

    def test_fake(self):

        self.create_pre_authenticated_session(u['username_dummy'])
        self.browser.get(self.server_url + '/')
        self.wait_to_be_signed_in(u['username_dummy'])

        u1 = User.objects.get(username=u['username_dummy'])
        Clip.objects.create_clip('Clip1', u1)
        Clip.objects.create_clip('Clip2', u1)
        Clip.objects.create_clip('Clip3', u1)
        Clip.objects.create_clip('Clip4', u1)


