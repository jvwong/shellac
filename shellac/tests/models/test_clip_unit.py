from django.test import TestCase
from shellac.models import Clip, Category
from django.contrib.auth.models import User

def get_categories():
    category_1 = Category()
    category_1.title = 'Title: Category 1'
    category_1.slug = 'title-category-1'
    category_1.description = 'Description: Category 1'
    category_1.save()

    category_2 = Category()
    category_2.title = 'Title: Category 2'
    category_2.slug = 'title-category-2'
    category_2.description = 'Description: Category 2'
    category_2.save()

    cats = [category_1, category_2]
    return cats


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

class ClipModelTest(TestCase):

    def test_for_saving_and_retrieving_clips(self):
        users = get_users()

        category_1 = Category()
        category_1.title = 'Title: Category 1'
        category_1.slug = 'title-category-1'
        category_1.description = 'Description: Category 1'
        category_1.save()

        category_2 = Category()
        category_2.title = 'Title: Category 2'
        category_2.slug = 'title-category-2'
        category_2.description = 'Description: Category 2'
        category_2.save()

        clip_1 = Clip()
        clip_1.title = 'Title: Clip 1'
        clip_1.author = users[0]
        clip_1.description = 'Description: Clip 1'
        clip_1.plays = 0
        clip_1.rating = 1
        clip_1.status = Clip.PUBLIC_STATUS
        clip_1.save()
        clip_1.categories.add(category_1)
        clip_1.tags.add('tag1', 'tag2')


        clip_2 = Clip()
        clip_2.title = 'Title: Clip 2'
        clip_2.author = users[1]
        clip_2.description = 'Description: Clip 2'
        clip_2.plays = 0
        clip_2.rating = 2
        clip_2.status = Clip.PRIVATE_STATUS
        clip_2.save()
        clip_2.categories.add(category_2)
        clip_2.tags.add('taga', 'tagb')


        saved_clips = Clip.objects.all()
        self.assertEqual(saved_clips.count(), 2)

        saved_clip_1 = saved_clips[0]
        self.assertEqual(saved_clip_1.title, 'Title: Clip 1')
        self.assertEqual(saved_clip_1.author.username, 'andrea')
        self.assertEqual(saved_clip_1.description, 'Description: Clip 1')
        self.assertEqual(saved_clip_1.plays, 0)
        self.assertEqual(saved_clip_1.rating, 1)
        self.assertEqual(saved_clip_1.status, Clip.PUBLIC_STATUS)
        self.assertEqual(saved_clip_1.slug, 'title-clip-1')
        self.assertEqual(users[0].clips.all().count(), 1)
        self.assertEqual(users[0].clips.all()[0].title, 'Title: Clip 1')
        #query on categories
        self.assertEqual(saved_clip_1.categories.all().count(), 1)
        self.assertEqual(saved_clip_1.categories.all()[0].slug, 'title-category-1')
        #query on tags returns a ValuesListQuery.list() will convert
        self.assertTrue('tag1' in list(saved_clip_1.tags.names()))
        self.assertTrue('tag2' in list(saved_clip_1.tags.names()))

        saved_clip_2 = saved_clips[1]
        self.assertEqual(saved_clip_2.title, 'Title: Clip 2')
        self.assertEqual(saved_clip_2.author.username, 'jvwong')
        self.assertEqual(saved_clip_2.description, 'Description: Clip 2')
        self.assertEqual(saved_clip_2.plays, 0)
        self.assertEqual(saved_clip_2.rating, 2)
        self.assertEqual(saved_clip_2.status, Clip.PRIVATE_STATUS)
        self.assertEqual(saved_clip_2.slug, 'title-clip-2')
        self.assertEqual(users[1].clips.all().count(), 1)
        self.assertEqual(users[1].clips.all()[0].title, 'Title: Clip 2')
        #query on categories
        self.assertEqual(saved_clip_2.categories.all().count(), 1)
        self.assertEqual(saved_clip_2.categories.all()[0].slug, 'title-category-2')
        #query on tags returns a ValuesListQuery.list() will convert
        self.assertTrue('taga' in list(saved_clip_2.tags.names()))
        self.assertTrue('tagb' in list(saved_clip_2.tags.names()))

