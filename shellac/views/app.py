from django.contrib.auth.decorators import login_required
from django.shortcuts import render

### player - default to this user's following set
@login_required(login_url='/accounts/signin/')
def shellac_main(request, *args, **kwargs):
    return render(request, 'shellac/app/main.html')

#  ### about
# @login_required(login_url='/accounts/signin/')
# def shellac_about(request, *args, **kwargs):
#     return render(request, 'shellac/app/about.html')
#
#
# ### Tune in
# @login_required(login_url='/accounts/signin/')
# def shellac_relations(request, *args, **kwargs):
#     return render(request, 'shellac/app/relations.html')
#
# ### View list of Persons
# @login_required(login_url='/accounts/signin/')
# def shellac_people(request, *args, **kwargs):
#     #Get the queryset to publish
#     queryset = Person.objects.exclude(user=request.user).order_by('-joined')
#     page_by = 25
#     return render(request, 'shellac/app/people.html', pagination.make_paginator(queryset, request, page_by))
#
# ### User profile
# @login_required(login_url='/accounts/signin/')
# def user_profile(request, *args, **kwargs):
#     #print(kwargs.get('username', None))
#     if request.method == 'GET':
#         person = get_object_or_404(Person, username=kwargs.get('username', None))
#     return render(request, 'shellac/app/profile.html', {'person': person})
#
# ### Permit User to change password
# from django.http import HttpResponseRedirect
# from shellac.forms import PersonUpdateForm
#
# @login_required(login_url='/accounts/signin/')
# def person_avatar_update(request, username):
#     person = get_object_or_404(Person, username=username)
#     if request.method == 'POST':
#         form = PersonUpdateForm(request.POST, request.FILES)
#         if 'avatar' in request.FILES and form.is_valid():
#             instance = form.save(commit=False)
#             person.avatar = instance.avatar
#             person.save()
#             return HttpResponseRedirect("/app/profile/" + person.username + "/")
#     else:
#         form = PersonUpdateForm()
#     return render(request, 'shellac/app/profile.html', {'form': form, 'person': person})
