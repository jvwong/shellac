from django.conf.urls import patterns, url, include
from django.contrib import admin
from django.conf import settings
from shellac.views.app import user_profile, shellac_app
from django.views.generic.dates import ArchiveIndexView
from shellac.models import Clip
admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^users/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),

    url(r'^$', shellac_app, name='shellac_app'),
    url(r'^profile/', user_profile, name='shellac_profile'),
    url(r'^clips/', include('shellac.urls.clips')),
)

if 'rosetta' in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        url(r'^rosetta/', include('rosetta.urls')),
    )



