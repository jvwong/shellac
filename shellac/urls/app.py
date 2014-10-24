from django.conf.urls import patterns, url, include
from django.contrib import admin

from shellac.views.app import shellac_app, shellac_relations, shellac_people, person_avatar_update
from search.views import search

admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),

    url(r'^$', shellac_app, name='shellac_app'),
    url(r'^info/', include('shellac.urls.info')),

    url(r'^player/(?P<username>[\w.@+-]+)/(?P<status>[a-z]+)/$', shellac_app, name='shellac_app'),

    url(r'profile/(?P<username>[\w.@+-]+)/$', person_avatar_update, name='shellac_profile'),

    url(r'^user/', include('shellac.urls.user')),
    url(r'^people/$', shellac_people, name='shellac_people'),
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





