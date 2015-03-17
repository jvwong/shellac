from django.conf.urls import patterns, url, include
from rest_framework.urlpatterns import format_suffix_patterns
from shellac.views.api import api_root, \
    CategoryViewSet, ClipListViewSet, ClipDetailViewSet, ClipListFollowingView, \
    UserListViewSet, UserDetailViewSet,\
    PersonListView, PersonDetailView, PersonListStatusView, PersonDetailCurrentView, \
    RelationshipListViewSet, RelationshipDetailViewSet,\
    PlaylistListViewSet, PlaylistDetailViewSet,\
    TrackListViewSet, TrackDetailViewSet

user_list = UserListViewSet.as_view({
    'get': 'get',
    'post': 'post',
})

user_detail = UserDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'delete': 'delete'
})

category_list = CategoryViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

category_detail = CategoryViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy'
})

clip_list = ClipListViewSet.as_view({
    'get': 'get',
    'post': 'post'
})

clip_detail = ClipDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'patch': 'patch',
    'delete': 'delete'
})

relationship_list = RelationshipListViewSet.as_view({
    'get': 'get',
    'post': 'post'
})

relationship_detail = RelationshipDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'delete': 'delete'
})

playlist_list = PlaylistListViewSet.as_view({
    'get': 'get',
    'post': 'post'
})

playlist_detail = PlaylistDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'patch': 'patch',
    'delete': 'delete'
})

track_list = TrackListViewSet.as_view({
    'get': 'get',
    'post': 'post'
})

track_detail = TrackDetailViewSet.as_view({
    'get': 'get',
    'put': 'put',
    'patch': 'patch',
    'delete': 'delete'
})


urlpatterns = patterns('shellac.views.api',
    url(r'^$', api_root, name='api_root'),

    url(r'^clips/$', clip_list, name='clip-list'),
    url(r'^clips/(?P<pk>[0-9]+)/$', clip_detail, name='clip-detail'),
    url(r'^clips/(?P<status>[\w-]+)/(?P<username>[\w.@+-]+)/$', ClipListFollowingView.as_view(), name='clip-list-following'),

    url(r'^categories/$', category_list, name='category-list'),
    url(r'^categories/(?P<slug>[\w-]+)/$', category_detail, name='category-detail'),

    url(r'^users/$', user_list, name='user-list'),
    url(r'^users/(?P<username>[\w.@+-]+)/$', user_detail, name='user-detail'),

    url(r'^person/$', PersonDetailCurrentView.as_view(), name='person-current'),

    url(r'^people/$', PersonListView.as_view(), name='person-list'),
    url(r'^people/(?P<status>[\w-]+)/(?P<username>[\w.@+-]+)/$', PersonListStatusView.as_view(), name='person-list-status'),
    url(r'^people/(?P<username>[\w.@+-]+)/$', PersonDetailView.as_view(), name='person-detail'),

    url(r'^relationships/$', relationship_list, name='relationship-list'),
    url(r'^relationships/(?P<pk>[0-9]+)/$', relationship_detail, name='relationship-detail'),

    url(r'^playlists/$', playlist_list, name='playlist-list'),
    url(r'^playlists/(?P<pk>[0-9]+)/$', playlist_detail, name='playlist-detail'),

    url(r'^tracks/$', track_list, name='track-list'),
    url(r'^tracks/(?P<pk>[0-9]+)/$', track_detail, name='track-detail')
)

urlpatterns = format_suffix_patterns(urlpatterns, allowed=['json', 'html'])