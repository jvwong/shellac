from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.views import APIView

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import Http404

from shellac.models import Clip, Category, Person
from shellac.serializers import CategorySerializer, UserSerializer, ClipSerializer, PersonSerializer
from shellac.permissions import IsOwnerOrReadOnly, UserIsOwnerOrAdmin, UserIsAdminOrPost
from shellac.viewsets import DetailViewSet, ListViewSet, FirehoseViewSet



@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'people': reverse('person-list', request=request, format=format),
        'categories': reverse('category-list', request=request, format=format),
        'clips': reverse('clip-list', request=request, format=format)
    })


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
        obj.author = self.request.user

    def get_queryset(self):
        #filter based on the provided username
        username = self.kwargs.get('username', '')
        if username:
            #print(username)
            return Clip.objects.filter(author__username=username)
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
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly,)

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


class PersonListView(APIView):
    """
    List all people
    """
    def get(self, request, format=None):
        people = Person.objects.all()
        serializer = PersonSerializer(people, many=True, context={'request': request})
        return Response(serializer.data)

    permission_classes = (permissions.IsAuthenticated, )


class PersonDetailView(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, user):
        try:
            return Person.objects.get(user=user)
        except Person.DoesNotExist:
            raise Http404

    def get(self, request, user, format=None):
        person = self.get_object(User.objects.get(username=user))
        serializer = PersonSerializer(person, context={'request': request})
        return Response(serializer.data)
