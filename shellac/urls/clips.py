from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required


from shellac.models import Clip
from shellac.views.clips import shellac_clip_create, \
    ClipDetailView, ClipUpdateView, ClipDeleteView, ClipListView

urlpatterns = patterns('',
   url(r'^list/$',
       ClipListView.as_view(),
       name='shellac_clip_list'),

    url(r'^create/$',
        shellac_clip_create,
        name='shellac_clip_create'),

    url(r'^(?P<pk>\d+)/detail/$',
        login_required(ClipDetailView.as_view()),
        name='shellac_clip_detail'),

    url(r'^(?P<pk>\d+)/update/$',
        login_required(ClipUpdateView.as_view()),
        name='shellac_clip_update'),

    url(r'^(?P<pk>\d+)/delete/$',
        login_required(ClipDeleteView.as_view()),
        name='shellac_clip_confirm_delete')


)


