from django.conf.urls import patterns, url
from shellac.views.accounts import user_accounts_signin, user_accounts_signout, user_accounts_signup

urlpatterns = patterns('',
   url(r'^signup/$', user_accounts_signup, name='shellac_accounts_signup'),
   url(r'^signin/$', user_accounts_signin, name='shellac_accounts_signin'),
   url(r'^signout/$', user_accounts_signout, name='shellac_accounts_signout')
)

