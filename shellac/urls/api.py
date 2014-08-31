from django.conf.urls import patterns, url
from shellac.views.api import CategoryList

urlpatterns = patterns('',

    url(r'^category/', CategoryList.as_view(), name='shellac_api_category'),
)




