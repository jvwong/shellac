from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.author == request.user.person


class RelationshipIsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow 1) staff 2) from_person to view.
    """
    def has_object_permission(self, request, view, obj):
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



