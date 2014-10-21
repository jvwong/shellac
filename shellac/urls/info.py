from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from shellac.views.info import AboutView, GettingStartedView, PrivacyView

urlpatterns = patterns('',
   url(r'^about/$', AboutView.as_view(), name='shellac_info_about'),

   url(r'^getting_started/$', GettingStartedView.as_view(), name='shellac_info_started'),

   url(r'^privacy/$', PrivacyView.as_view(), name='shellac_info_privacy')
)


