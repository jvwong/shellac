from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from shellac.forms import RecordForm
from django.http import HttpResponsePermanentRedirect
from audiofield.widgets import CustomerAudioFileWidget
from audiofield.forms import CustomerAudioFileForm
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User

from shellac.models import Clip

### app
@login_required()
def shellac_app(request):
    if request.method == 'GET':
        clips = Clip.objects.all()[:10]
        return render(request, 'shellac/app.html', {'objects': clips})
    return render(request, 'shellac/app.html')


### User profile
@login_required()
def user_profile(request):
    return render(request, 'shellac/profile.html')


## Record
@login_required()
def shellac_record(request):
    if request.method == 'POST':
        form = RecordForm(request.POST, request.FILES)
        if form.is_valid():
            #save a new Clip object from the data passed
            new_clip = form.save(commit=False)
            new_clip.author = request.user
            new_clip.save()
            if new_clip.categories.all().count() > 0:
                new_clip.save_m2m()
            return HttpResponsePermanentRedirect(new_clip.get_absolute_url())
    else:
        form = RecordForm()
    return render(request,
                  'shellac/record.html',
                  {'form': form})


@login_required
def add_audio(request):
    template = 'shellac/add_audio.html'
    form = CustomerAudioFileForm()

    # Add audio
    if request.method == 'POST':
        form = CustomerAudioFileForm(request.POST, request.FILES)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.user = User.objects.get(username=request.user)
            obj.save()
            return HttpResponseRedirect('/')

        # To retain frontend widget, if form.is_valid() == False
        form.fields['audio_file'].widget = CustomerAudioFileWidget()

    data = {
       'audio_form': form,
    }
    return render(request, template, data)

# ###Return JSON receipts
# from django.http import HttpResponse
# from django.utils import simplejson
# from django.views.generic.detail import View, BaseDetailView, SingleObjectTemplateResponseMixin
# from django.views.generic.list import ListView, MultipleObjectTemplateResponseMixin
#
# class JSONResponseMixin(object):
#     def render_to_response(self, context):
#         return self.get_json_response(self.convert_context_to_json(context))
#     def get_json_response(self, content, **httpresponse_kwargs):
#         return HttpResponse(content, content_type='application/json', **httpresponse_kwargs)
#     def convert_context_to_json(self, context):
#         return simplejson.dumps(context)
#
# class HybridListView(JSONResponseMixin, ListView):
#     def render_to_response(self, context):
#         current_user = self.request.user
#         if self.request.is_ajax():
#             context['object_list'] = Receipt.user_objects.for_user(current_user)
#             o_list = context['object_list']
#             j_list = [o.as_dict() for o in o_list]
#             return JSONResponseMixin.render_to_response(self, j_list)
#         return MultipleObjectTemplateResponseMixin.render_to_response(self, context)
#
#
# class HybridDetailView(JSONResponseMixin, SingleObjectTemplateResponseMixin, BaseDetailView):
#     def render_to_response(self, context):
#         if self.request.is_ajax():
#             logging.error("Ajax Request Logged")
#             obj = context['object'].as_dict()
#             return JSONResponseMixin.render_to_response(self, obj)
#         else:
#             return SingleObjectTemplateResponseMixin.render_to_response(self, context)
