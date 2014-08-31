from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import CategoryList, CategoryDetail

urlpatterns = patterns('',
    url(r'^category/$', CategoryList.as_view(), name='shellac_api_category'),
    url(r'^category/(?P<slug>[-\w]+)/$', CategoryDetail.as_view(), name='shellac_api_category_detail'),
)

urlpatterns = format_suffix_patterns(urlpatterns)




