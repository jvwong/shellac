from django import forms
from django.contrib.auth.admin import User
from django.contrib.auth.forms import UserCreationForm
from shellac.models import Clip
from django.forms import ModelForm

class UserCreateForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreateForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class LoginForm(forms.Form):
    username = forms.CharField(max_length=30)
    password = forms.CharField(max_length=30,
                               widget=forms.PasswordInput(render_value=False))

    def clean(self):
        if 'username' in self.cleaned_data and 'password' in self.cleaned_data:
            try:
                User.objects.get(username=self.cleaned_data['username'],
                                 password=self.cleaned_data['password'])
            except User.DoesNotExist:
                raise forms.ValidationError("User does not exist")
        return self.cleaned_data


class CreateClipForm(ModelForm):

    class Meta:
        model = Clip
        exclude = ['author', 'slug', 'plays', 'rating']


