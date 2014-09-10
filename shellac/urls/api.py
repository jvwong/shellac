from django.conf.urls import patterns, url, include
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import api_root, CategoryViewSet, ClipViewSet, UserViewSet

user_list = UserViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

user_detail = UserViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
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

clip_list = ClipViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

clip_detail = ClipViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
})

urlpatterns = patterns('shellac.views.api',
    url(r'^$', api_root, name='api_root'),
    url(r'^clips/$', clip_list, name='clip-list'),
    url(r'^clips/(?P<pk>[0-9]+)/$', clip_detail, name='clip-detail'),
    url(r'^categories/$', category_list, name='category-list'),
    url(r'^categories/(?P<slug>[-\w]+)/$', category_detail, name='category-detail'),
    url(r'^users/$', user_list, name='user-list'),
    url(r'^users/(?P<username>[-\w]+)/$', user_detail, name='user-detail')
)

urlpatterns = format_suffix_patterns(urlpatterns, allowed=['json', 'html'])





