from shellac.forms import UserCreateForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth import authenticate

### Signup user
def user_signup(request):
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
                  'accounts/signup.html',
                  {'form': form})


### Login user
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth import login, authenticate
from shellac.forms import LoginForm


def user_signin(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        name = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=name, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect("/profile")
    else:
        form = LoginForm()
    return render(request,
                  'accounts/signin.html',
                  {'form': form})


@login_required(login_url='/users/signin/')
def user_signout(request):
    logout(request)
    return HttpResponseRedirect('/')