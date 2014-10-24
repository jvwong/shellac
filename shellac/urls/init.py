from django.conf.urls import patterns, url

from shellac.views.init import shellac_init_category

urlpatterns = patterns('',

    url(r'^category/$', shellac_init_category, name='shellac_init_category'),
)






