from shellac.forms import UserCreateForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

from django.http import HttpResponseRedirect


def anonymous_required(view_function, redirect_to=None):
    return AnonymousRequired(view_function, redirect_to)


class AnonymousRequired(object):
    def __init__(self, view_function, redirect_to):
        if redirect_to is None:
            from django.conf import settings
            redirect_to = settings.LOGIN_REDIRECT_URL
        self.view_function = view_function
        self.redirect_to = redirect_to

    def __call__(self, request, *args, **kwargs):
        if hasattr(request, 'user') and request.user.is_authenticated():
            return HttpResponseRedirect(self.redirect_to)
        return self.view_function(request, *args, **kwargs)

### Signup user
def user_accounts_signup(request):
    if request.method == 'POST':
        form = UserCreateForm(data=request.POST)

        if form.is_valid():
            username = form.clean_username()
            password = form.clean_password2()
            form.save()
            new_user = authenticate(username=username, password=password)

            if new_user:
                login(request, new_user)
                return HttpResponseRedirect("/profile/")
    else:
        form = UserCreateForm()
    return render(request,
                  'shellac/accounts/signup.html',
                  {'form': form})
user_signup = anonymous_required(user_accounts_signup, redirect_to='/')

### Login user
from django.shortcuts import render
from django.contrib.auth import login, authenticate
from shellac.forms import LoginForm

def user_accounts_signin(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        name = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=name, password=password)
        if user is not None:
            if not request.POST.get('remember_me', None):
                request.session.set_expiry(0)
            login(request, user)
            return HttpResponseRedirect("/profile")
    else:
        form = LoginForm()
    return render(request,
                  'shellac/accounts/signin.html',
                  {'form': form})
user_signin = anonymous_required(user_accounts_signin, redirect_to='/')


@login_required(login_url='/accounts/signin/')
def user_accounts_signout(request):
    logout(request)
    return HttpResponseRedirect('/')


