from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from shellac.models import Person
from django.views.generic.list import ListView

### app
@login_required(login_url='/accounts/signin/')
def shellac_app(request, *args, **kwargs):
    username = kwargs.get('username', None)
    if username is not None:
        return render(request, 'shellac/app/app.html', {'username': username})
    return render(request, 'shellac/app/app.html', {'username': request.user.username})


### User profile
@login_required(login_url='/accounts/signin/')
def user_profile(request, *args, **kwargs):
    #print(kwargs.get('username', None))
    person = get_object_or_404(Person, username=kwargs.get('username', None))
    return render(request, 'shellac/app/profile.html', {'person': person})


### Tune in
@login_required(login_url='/accounts/signin/')
def shellac_tune(request, *args, **kwargs):
    return render(request, 'shellac/app/tune.html')


### View list of Persons
class PersonListView(ListView):
    model = Person
    template_name = 'shellac/app/people.html'
    queryset = Person.objects.all().order_by('-joined')
    allow_empty = True
    paginate_by = 25



