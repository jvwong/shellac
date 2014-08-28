from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from shellac.forms import CreateClipForm
from django.http import HttpResponsePermanentRedirect

## Create
@login_required(login_url='/accounts/signin/')
def shellac_clips_create(request):
    if request.method == 'POST':
        form = CreateClipForm(request.POST, request.FILES)
        if form.is_valid():
            #save a new Clip object from the data passed
            new_clip = form.save(commit=False)
            new_clip.author = request.user
            new_clip.save()
            if new_clip.categories.all().count() > 0:
                new_clip.save_m2m()
            return HttpResponsePermanentRedirect(new_clip.get_absolute_url())
    else:
        form = CreateClipForm()
    return render(request,
                  'shellac/clips/create.html',
                  {'form': form})