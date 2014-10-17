from rest_framework import permissions
from shellac.models import Playlist



class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS or request.method == 'PATCH':
            return True

        # Write permissions are only allowed to the owner
        return obj.author == request.user.person


def getPlaylistFromURL(playlistURL):
    import re
    regex_playlist_pk = re.compile('([0-9]+)')
    m = regex_playlist_pk.search(playlistURL)

    if m:
        start = m.span()[0]
        end = m.span()[1]

        if start and end:
           return Playlist.objects.filter(pk=playlistURL[start:end])[0]

    return None



class TrackListViewPermissions(permissions.BasePermission):
    """
    Custom permission to only allow user to create Track within their
    own Playlists
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        ##Ensure the user owns the playlist (pk) we're posting to
        if view.action == "post":
            playlistURL = request.DATA.get('playlist', None)

            if playlistURL:
                qlist = getPlaylistFromURL(playlistURL)
                return qlist and qlist.person == request.user.person
        return False


class TrackDetailViewPermissions(permissions.BasePermission):
    """
    Custom permission to only allow owners of a track's Playlist to edit it
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        #ensure that the request.user.person is the playlist owner
        if view.action == 'delete':
            return obj.playlist.person == request.user.person

        else: #put or patch
            playlistURL = request.DATA.get('playlist', None)

            #If PUT then this must be present; For PUT and PATCH, if present
            # the playlist must belong to the logged in user
            if playlistURL:
                qlist = getPlaylistFromURL(playlistURL)
                return qlist and qlist.person == request.user.person and obj.playlist.person == request.user.person
            else:
                return obj.playlist.person == request.user.person



class PlaylistListViewPermissions(permissions.BasePermission):
    """
    Custom permission to only allow user to post their own Playlists
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        ##Ensure the request.user is the person in the payload
        if view.action == "post":
            personURL = request.DATA.get('person', None)
            return personURL and personURL.rfind(request.user.username) > -1
        return False


class PlaylistDetailViewPermissions(permissions.BasePermission):
    """
    Custom permission to only allow owners of Playlist object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        if view.action == "put":
            person = request.DATA.get('person', None)
            return person and person.rfind(request.user.username) > -1 and obj.person == request.user.person

        # Write permissions are only allowed to the owner
        return obj.person == request.user.person

class RelationshipIsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow 1) staff 2) from_person to view.
    """
    def has_object_permission(self, request, view, obj):
        #print("PERMISSIONS OBJECT")
        if request.method in permissions.SAFE_METHODS:
            return True
        return (request.user.is_staff or obj.from_person == request.user.person)


class UserIsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow staff or owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return (request.user.is_staff or obj == request.user)


class UserIsAdminOrPost(permissions.BasePermission):
    """
    Custom permission to only allow staff to view but anyone to POST
    """
    def has_permission(self, request, view):
        return (request.user.is_staff or view.action == "post")



