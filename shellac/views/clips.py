from django.contrib.auth.decorators import permission_required, login_required
from django.shortcuts import render
from django.http import HttpResponsePermanentRedirect, HttpResponseRedirect
from django.contrib.auth import get_user_model
User = get_user_model()
from django.core.urlresolvers import reverse, reverse_lazy
from django.views.generic.detail import DetailView
from django.views.generic.edit import UpdateView, DeleteView
from django.views.generic.list import ListView

from shellac.forms import CreateClipForm
from shellac.models import Clip
from shellac.views.util.permissions import Clip_IsAuthenticatedAndOwnerMixin


class ClipListView(ListView):
    model = Clip
    template_name = 'shellac/clips/clip_list.html'
    paginate_by = 10

    def get_queryset(self):
        return Clip.objects.filter(author=self.request.user.person).order_by('-created')

    def get_context_data(self, **kwargs):
        context = super(ClipListView, self).get_context_data(**kwargs)
        return context


## CRUD
@permission_required('shellac.add_clip', raise_exception=True)
def shellac_clip_create(request):
    if request.method == 'POST':
        form = CreateClipForm(request.POST, request.FILES)
        if form.is_valid():
            #save a new Clip object from the data passed
            new_clip = form.save(commit=False)
            new_clip.author = request.user.person
            new_clip.save()
            form.save_m2m()
            return HttpResponsePermanentRedirect(new_clip.get_absolute_url())
    else:
        form = CreateClipForm()
    return render(request,
                  'shellac/clips/create.html',
                  {'form': form})


class ClipDetailView(DetailView):
    model = Clip
    template_name = "shellac/clips/clip_detail.html"


class ClipUpdateView(Clip_IsAuthenticatedAndOwnerMixin, UpdateView):
    model = Clip
    fields = ['title', 'categories', 'description', 'brand',
              'status', 'created', 'audio_file', 'tags']
    template_name = 'shellac/clips/clip_update_form.html'

    def get_success_url(self):
        pk = self.kwargs.get('pk')
        return reverse('shellac_clip_detail', kwargs={'pk': pk})



class ClipDeleteView(Clip_IsAuthenticatedAndOwnerMixin, DeleteView):
    model = Clip
    template_name = 'shellac/clips/clip_confirm_delete.html'
    success_url = reverse_lazy('shellac_clip_list')

    def get_context_data(self, **kwargs):
        context = super(ClipDeleteView, self).get_context_data(**kwargs)
        return context
