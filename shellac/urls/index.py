from django.conf.urls import patterns, url, include
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.views.generic.base import RedirectView

admin.autodiscover()
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('shellac.urls.accounts')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),
    url(r'^$', RedirectView.as_view(url='/api', permanent=True), name='shellac_index_redirect'),
    url(r'^api/', include('shellac.urls.api')),
)

# Login and logout views for the browsable API
urlpatterns += patterns('',
    #url(r'^accounts/$', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-token-auth/$', 'rest_framework.authtoken.views.obtain_auth_token')
)





