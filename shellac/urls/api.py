from django.conf.urls import patterns, url, include
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import api_root, \
    CategoryViewSet, ClipListViewSet,  ClipFirehoseViewSet, ClipDetailViewSet, \
    UserListViewSet, UserDetailViewSet,\
    PersonListView, PersonDetailView

user_list = UserListViewSet.as_view({
    'get': 'get',
    'post': 'post',
})

user_detail = UserDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'delete': 'delete'
})

category_list = CategoryViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

category_detail = CategoryViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
})

clip_firehose = ClipFirehoseViewSet.as_view({
    'get': 'get'
})

clip_list = ClipListViewSet.as_view({
    'get': 'get',
    'post': 'post'
})

clip_detail = ClipDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'delete': 'delete'
})

urlpatterns = patterns('shellac.views.api',
    url(r'^$', api_root, name='api_root'),
    url(r'^clips/$', clip_list, name='clip-list'), #By 'following'
    url(r'^clips/firehose/$', clip_firehose, name='clip-firehose'), #Firehose
    url(r'^clips/search/(?P<person>[\w]+)/$', clip_list, name='clip-list'), #By Person
    url(r'^clips/(?P<pk>[0-9]+)/$', clip_detail, name='clip-detail'), #By pk

    url(r'^categories/$', category_list, name='category-list'),
    url(r'^categories/(?P<slug>[-\w]+)/$', category_detail, name='category-detail'),
    url(r'^users/$', user_list, name='user-list'),
    url(r'^users/(?P<username>[-\w]+)/$', user_detail, name='user-detail'),

    url(r'^people/$', PersonListView.as_view(), name='person-list'),
    url(r'^people/(?P<user>[-\w]+)/$', PersonDetailView.as_view(), name='person-detail')
)

urlpatterns = format_suffix_patterns(urlpatterns, allowed=['json', 'html'])