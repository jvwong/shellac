from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import CategoryList, CategoryDetail, UserList, UserDetail, ClipList, ClipDetail, api_root

urlpatterns = patterns('',
    url(r'^$', api_root, name='shellac_api_root'),

    url(r'^category/$', CategoryList.as_view(), name='shellac_api_category_list'),
    url(r'^category/(?P<slug>[-\w]+)/$', CategoryDetail.as_view(), name='shellac_api_category_detail'),

    url(r'^user/$', UserList.as_view(), name='shellac_api_user_list'),
    url(r'^user/(?P<username>[-\w]+)/$', UserDetail.as_view(), name='shellac_api_user_detail'),

    url(r'^clip/$', ClipList.as_view(), name='shellac_api_clip_list'),
    url(r'^clip/(?P<pk>[\d]+)/$', ClipDetail.as_view(), name='shellac_api_clip_detail'),
)

urlpatterns = format_suffix_patterns(urlpatterns)




