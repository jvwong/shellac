from django.conf.urls import patterns, url, include
from django.contrib import admin
from search.views import search
from shellac.views.app import shellac_main

admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),

    url(r'^$', shellac_main, name='shellac_main'),

    url(r'^info/', include('shellac.urls.info')),
    url(r'^user/', include('shellac.urls.user')),
    url(r'^api/', include('shellac.urls.api')),
    url(r'^clips/', include('shellac.urls.clips')),
    url(r'^search/', search, name='search'),
)

# Login and logout views for the browsable API
urlpatterns += patterns('',
    url(r'^accounts/$', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-token-auth/$', 'rest_framework.authtoken.views.obtain_auth_token')
)





