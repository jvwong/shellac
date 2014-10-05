from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404

from shellac.models import Person
from shellac.views.util import pagination

### app
@login_required(login_url='/accounts/signin/')
def shellac_app(request, *args, **kwargs):
    username = kwargs.get('username', None)
    if username is not None:
        return render(request, 'shellac/app/app.html', {'target_username': username})
    return render(request, 'shellac/app/app.html', {'target_username': request.user.username})


### User profile
@login_required(login_url='/accounts/signin/')
def user_profile(request, *args, **kwargs):
    #print(kwargs.get('username', None))
    if request.method == 'GET':
        person = get_object_or_404(Person, username=kwargs.get('username', None))
    return render(request, 'shellac/app/profile.html', {'person': person})

### Tune in
@login_required(login_url='/accounts/signin/')
def shellac_relations(request, *args, **kwargs):
    return render(request, 'shellac/app/relations.html')

### View list of Persons
@login_required(login_url='/accounts/signin/')
def shellac_people(request, *args, **kwargs):
    #Get the queryset to publish
    queryset = Person.objects.exclude(user=request.user).order_by('-joined')
    page_by = 25
    return render(request, 'shellac/app/people.html', pagination.make_paginator(queryset, request, page_by))





