from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import CategoryList, CategoryDetail, UserList, UserDetail, ClipList, ClipDetail

urlpatterns = patterns('',
    url(r'^category/$', CategoryList.as_view(), name='shellac_api_category'),
    url(r'^category/(?P<slug>[-\w]+)/$', CategoryDetail.as_view(), name='shellac_api_category_detail'),

    url(r'^user/$', UserList.as_view(), name='shellac_api_user'),
    url(r'^user/(?P<username>[-\w]+)/$', UserDetail.as_view(), name='shellac_api_user_detail'),

    url(r'^clip/$', ClipList.as_view(), name='shellac_api_clip'),
    url(r'^clip/(?P<pk>[-\w]+)/$', ClipDetail.as_view(), name='shellac_api_clip_detail'),
)

urlpatterns = format_suffix_patterns(urlpatterns)




