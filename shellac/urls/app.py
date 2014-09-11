from django.conf.urls import patterns, url, include
from django.contrib import admin
from django.conf import settings
from shellac.views.app import user_profile, shellac_app
admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),
    url(r'^$', shellac_app, name='shellac_app'),
    url(r'^profile/', user_profile, name='shellac_profile'),

    url(r'^api/', include('shellac.urls.api')),
    url(r'^clips/', include('shellac.urls.clips')),
)

# Login and logout views for the browsable API
urlpatterns += patterns('',
    url(r'^accounts/$', include('rest_framework.urls', namespace='rest_framework')),
)





