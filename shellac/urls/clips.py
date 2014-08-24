from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from django.views.generic.dates import ArchiveIndexView, YearArchiveView, MonthArchiveView, DayArchiveView, DateDetailView
from shellac.models import Clip
from shellac.views.app import shellac_record, add_audio

urlpatterns = patterns('',
    url(r'^record/', shellac_record, name='shellac_clips_record'),
    url(r'^add/', add_audio, name='shellac_clips_add'),

    # url(r'^$', ArchiveIndexView.as_view( queryset = Clip.objects.all(),
    #                                      date_field = 'pub_date',
    #                                      allow_empty = True,
    #                                      paginate_by = 5,
    #                                     ), name='jraywo_entry_archive_index'),
    # url(r'^(?P<year>\d{4})/$', YearArchiveView.as_view(queryset = Entry.live.all(),
    #                                                    date_field='pub_date',
    #                                                    allow_empty = True,
    #                                                    make_object_list=True), name='jraywo_entry_archive_year'),
    # url(r'^(?P<year>\d{4})/(?P<month>\w{3})/$', MonthArchiveView.as_view(queryset = Entry.live.all(),
    #                                                                      date_field = 'pub_date',
    #                                                                      allow_empty = True,
    #                                                                      paginate_by = 5,
    #                                                                      ), name='jraywo_entry_archive_month'),
    # url(r'^(?P<year>\d{4})/(?P<month>\w{3})/(?P<day>\d{2})/$', DayArchiveView.as_view(queryset = Entry.live.all(),
    #                                                                                   date_field = 'pub_date',
    #                                                                                   allow_empty = True,
    #                                                                                    paginate_by = 5,
    #                                                                                   ), name='jraywo_entry_archive_day'),
    url(r'^(?P<year>\d{4})/(?P<month>\w{3})/(?P<day>\d{2})/(?P<slug>[-\w]+)/$',
        login_required(DateDetailView.as_view(model=Clip,
                                              date_field='created')),
        name='shellac_clip_detail')
)


