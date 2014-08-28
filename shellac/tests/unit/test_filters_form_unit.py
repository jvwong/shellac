from django.test import TestCase
from django.http import HttpRequest
from django.shortcuts import render
from django.template.loader import render_to_string

#Create a simple model
from django.db import models
class TestModel(models.Model):
    title = models.CharField(max_length=250)

#Create a simple form
from django.forms import ModelForm
class TestForm(ModelForm):
    class Meta:
        model = TestModel
        exclude = []

def test_view(request):
    form = TestForm()
    return render(request,
                  'shellac/custom_tests/bootstrap_form.html',
                  {'form': form})

# GET /record
class BootstrapFormFilterTest(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass


    def test_test_view_returns_correct_html(self):
        request = HttpRequest()
        response = test_view(request)
        expected_html = render_to_string('shellac/custom_tests/bootstrap_form.html', {'form': TestForm()})
        self.assertEqual(response.content.decode(), expected_html)


    def test_add_class_inserts_correct_class(self):
        request = HttpRequest()
        response = test_view(request)
        expected_html = render_to_string('shellac/custom_tests/bootstrap_form.html', {'form': TestForm()})
        self.assertEqual(expected_html, response.content.decode())
        self.assertInHTML('<input id="id_title" maxlength="250" class="form-control" name="title" type="text" />',
                      response.content.decode()
        )

    def test_add_attributes_inserts_correct_attr(self):
        request = HttpRequest()
        response = test_view(request)
        expected_html = render_to_string('shellac/custom_tests/bootstrap_form.html', {'form': TestForm()})
        self.assertEqual(expected_html, response.content.decode())
        self.assertInHTML('<input id="id_title" maxlength="250" color="red" name="title" type="text" />',
                      response.content.decode()
        )

