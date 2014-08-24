from django.conf.urls import patterns, url
from shellac.views.accounts import user_signin, user_signout, user_signup

urlpatterns = patterns('',
   url(r'^signup/$', user_signup, name='shellac_users_signup'),
   url(r'^signin/$', user_signin, name='shellac_users_signin'),
   url(r'^signout/$', user_signout, name='shellac_users_signout')
)

