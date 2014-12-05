from django.conf.urls import patterns, url

from shellac.views.app import shellac_app, shellac_relations, shellac_people, person_avatar_update

urlpatterns = patterns('',
                       url(r'^$', shellac_app, name='shellac_app'),

                       url(r'^player/(?P<username>[\w.@+-]+)/(?P<status>[a-z]+)/$',
                           shellac_app,
                           name='shellac_app'),

                       url(r'profile/(?P<username>[\w.@+-]+)/$',
                           person_avatar_update,
                           name='shellac_profile'),

                       url(r'^people/$',
                           shellac_people,
                           name='shellac_people'),

                       url(r'^relations/$',
                           shellac_relations,
                           name='shellac_relations')
)



