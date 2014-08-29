from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from shellac.models import Clip
import json

### app
@login_required(login_url='/accounts/signin/')
def shellac_app(request):
    if request.method == 'GET':
        objects = Clip.objects.all()[:10]
        data = [o.serialize() for o in objects]
        return render(request, 'shellac/app/app.html', {'data': data })
    return render(request, 'shellac/app/app.html')


### User profile
@login_required(login_url='/accounts/signin/')
def user_profile(request):
    return render(request, 'shellac/app/profile.html')
