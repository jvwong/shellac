from django.conf.urls import patterns, url, include
from django.conf import settings

urlpatterns = patterns('')

if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    urlpatterns += patterns('', (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}))

urlpatterns += patterns('',

    url(r'^', include('shellac.urls.app')),

)

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
urlpatterns += staticfiles_urlpatterns()


