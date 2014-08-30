from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from django.views.generic.dates import DateDetailView
from shellac.models import Clip
from shellac.views.clips import shellac_clips_create, shellac_clips_by_category

urlpatterns = patterns('',
    url(r'^create/',
        shellac_clips_create,
        name='shellac_clips_create'
    ),
    url(r'^(?P<slug>[-\w]+)/', shellac_clips_by_category, name='shellac_clips_by_category'),
    url(r'^(?P<year>\d{4})/(?P<month>\w{3})/(?P<day>\d{2})/(?P<slug>[-\w]+)/$',
        login_required(DateDetailView.as_view(model=Clip,
                                              template_name="shellac/clips/clip_detail.html",
                                              date_field='created')),
        name='shellac_clip_detail')
)


