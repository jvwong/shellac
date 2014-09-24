from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import status

from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import QueryDict

from shellac.models import Clip, Category, Person, Relationship
from shellac.serializers import CategorySerializer, UserSerializer, \
    ClipSerializer, PersonSerializer, RelationshipSerializer
from shellac.permissions import IsAuthorOrReadOnly, UserIsOwnerOrAdmin, \
    UserIsAdminOrPost, RelationshipIsOwnerOrAdmin
from shellac.viewsets import DetailViewSet, ListViewSet, FirehoseViewSet


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'relationships': reverse('relationship-list', request=request, format=format),
        'people': reverse('person-list', request=request, format=format),
        'categories': reverse('category-list', request=request, format=format),
        'clips': reverse('clip-list', request=request, format=format)
    })

from urllib.parse import urlparse
class RelationshipListViewSet(ListViewSet):
    serializer_class = RelationshipSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        """
        This view should return a list of all the Relationships for
        the authenticated User / Person.
        """
        ##Check for the url keyword arguments
        return Relationship.objects.filter(
            Q(from_person=self.request.user.person) |
            Q(to_person=self.request.user.person))

    def post(self, request, *args, **kwargs):
        """
        This view should create between the authenticated Person and
        the target with the given status and return a Relationship
        """
        return self.create(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        #validate whether authenticated user is from_user
        from_person = request.DATA.get('from_person', '')
        u = urlparse(from_person).path.split('/')[3]
        serializer = RelationshipSerializer(data=request.DATA, context={'request': request})

        if u != self.request.user.person.username:
            return Response(serializer.errors, status=status.HTTP_)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def pre_save(self, obj):
        obj.from_person = self.request.user.person


class RelationshipDetailViewSet(DetailViewSet):
    lookup_field = 'pk'
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer
    permission_classes = (permissions.IsAuthenticated, RelationshipIsOwnerOrAdmin)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def pre_save(self, obj):
        obj.from_person = self.request.user.person


class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ClipListViewSet(ListViewSet):
    lookup_field = 'pk'
    serializer_class = ClipSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def pre_save(self, obj):
        obj.author = Person.objects.get(user=self.request.user)

    def get_queryset(self):
        #filter based on the provided username
        username = self.kwargs.get('username', None)
        if username is not None:
            return Clip.objects.filter(author__user__username=username)
        return Clip.objects.all() ##By 'following'

    def get_paginate_by(self):
        #print(self.request.accepted_renderer.format)
        if self.request.accepted_renderer.format == 'api':
            return 20
        elif self.request.accepted_renderer.format == 'json':
            return 100
        else:
            return 100


class ClipFirehoseViewSet(FirehoseViewSet):
    serializer_class = ClipSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        return Clip.objects.all() ##By 'following'

    def get_paginate_by(self):
        #print(self.request.accepted_renderer.format)
        if self.request.accepted_renderer.format == 'api':
            return 20
        elif self.request.accepted_renderer.format == 'json':
            return 100
        else:
            return 100


class ClipDetailViewSet(DetailViewSet):
    lookup_field = 'pk'
    queryset = Clip.objects.all()
    serializer_class = ClipSerializer
    permission_classes = (permissions.IsAuthenticated, IsAuthorOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class UserListViewSet(ListViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (UserIsAdminOrPost,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class UserDetailViewSet(DetailViewSet):
    lookup_field = 'username'
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated, UserIsOwnerOrAdmin,)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class PersonListView(generics.ListCreateAPIView):
    """
    List only; DO NOT allow create Person -- do this through User
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class PersonDetailView(generics.RetrieveAPIView):
    """
    Retrieve a Person
    """
    lookup_field = 'username'
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)