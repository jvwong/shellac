from django.conf.urls import patterns, url, include
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns


urlpatterns = patterns('')

##For development, let Django server the static files directly
if settings.DEBUG:
    urlpatterns += patterns('', (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}))
    urlpatterns += staticfiles_urlpatterns()


urlpatterns += patterns('',

    url(r'^', include('shellac.urls.app')),

)





