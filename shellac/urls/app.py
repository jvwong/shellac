from django.conf.urls import patterns, url, include
from django.contrib import admin
from shellac.views.app import user_profile, shellac_app, shellac_relations, PersonListView

from search.views import search
admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),
    url(r'^$', shellac_app, name='shellac_app'),
    url(r'^app/(?P<username>[\w.@+-]+)/$', shellac_app, name='shellac_app'),
    url(r'^profile/(?P<username>[\w.@+-]+)/$', user_profile, name='shellac_profile'),
    url(r'^people/$', PersonListView.as_view(), name='shellac_person_list'),
    url(r'^relations/$', shellac_relations, name='shellac_relations'),

    url(r'^api/', include('shellac.urls.api')),
    url(r'^clips/', include('shellac.urls.clips')),
    url(r'^search/', search, name='search'),
)

# Login and logout views for the browsable API
urlpatterns += patterns('',
    url(r'^accounts/$', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-token-auth/$', 'rest_framework.authtoken.views.obtain_auth_token')
)





