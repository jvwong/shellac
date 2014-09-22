from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from shellac.models import Clip


### app
@login_required(login_url='/accounts/signin/')
def shellac_app(request):
    if request.method == 'GET':
        objects = Clip.objects.all()[:10]
        return render(request, 'shellac/app/app.html', {'objects': objects})
    return render(request, 'shellac/app/app.html')


### User profile
@login_required(login_url='/accounts/signin/')
def user_profile(request):
    return render(request, 'shellac/app/profile.html')


### Tune in
@login_required(login_url='/accounts/signin/')
def shellac_tune(request):
    return render(request, 'shellac/app/tune.html')






