from django.test import TestCase
from shellac.models import Category, Clip

class CategoryModelTest(TestCase):

    def test_saving_and_retrieving_categories(self):
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

        saved_categories = Category.objects.all()
        self.assertEqual(saved_categories.count(), 2)

        saved_category_1 = saved_categories[0]
        saved_category_2 = saved_categories[1]
        self.assertEqual(saved_category_1.title, 'Title: Category 1'.upper())
        self.assertEqual(saved_category_1.description, 'Description: Category 1')
        self.assertEqual(saved_category_1.slug, 'title-category-1')
        self.assertEqual(saved_category_2.title, 'Title: Category 2'.upper())
        self.assertEqual(saved_category_2.description, 'Description: Category 2')
        self.assertEqual(saved_category_2.slug, 'title-category-2')

    def test_autopopulate(self):
        Category.objects.autopopulate()
        cato = Category.objects.all()
        cats = [c.title for c in cato]

        self.assertIn('MUSIC', cats)
        self.assertIn('BUSINESS', cats)
        self.assertIn('FOOD', cats)
        self.assertIn('HEALTH', cats)
        self.assertIn('OPINION', cats)




