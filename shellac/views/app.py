from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from shellac.models import Clip, Person


### app
@login_required(login_url='/accounts/signin/')
def shellac_app(request):
    if request.method == 'GET':
        objects = Clip.objects.all()[:10]
        return render(request, 'shellac/app/app.html', {'objects': objects})
    return render(request, 'shellac/app/app.html')


### User profile
@login_required(login_url='/accounts/signin/')
def user_profile(request, *args, **kwargs):
    #print(kwargs.get('username', None))
    person = get_object_or_404(Person, username=kwargs.get('username', None))
    return render(request, 'shellac/app/profile.html', {'person': person})


### Tune in
@login_required(login_url='/accounts/signin/')
def shellac_tune(request):
    return render(request, 'shellac/app/tune.html')






