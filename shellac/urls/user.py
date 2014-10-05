# urls.py
from django.conf.urls import patterns, url
from shellac.views.user import UserDetailView, UserUpdate, UserDelete

urlpatterns = patterns('',
    url(r'(?P<pk>\d+)/update/$', UserUpdate.as_view(), name='user_update'),
    url(r'(?P<pk>\d+)/delete/$', UserDelete.as_view(), name='user_delete'),
    url(r'(?P<pk>\d+)/$', UserDetailView.as_view(), name='user_detail'),

)