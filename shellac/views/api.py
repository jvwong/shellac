from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import status

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import Http404

from shellac.models import Clip, Category, Person
from shellac.serializers import CategorySerializer, UserSerializer, ClipSerializer, PersonSerializer
from shellac.permissions import IsAuthorOrReadOnly, UserIsOwnerOrAdmin, UserIsAdminOrPost
from shellac.viewsets import DetailViewSet, ListViewSet, FirehoseViewSet, ListOnlyViewSet, RetrieveOnlyView

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

    # def post(self, request, format=None):
    #     serializer = ClipSerializer(data=request.DATA, files=request.FILES, context={'request': request})
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def pre_save(self, obj):
        obj.author = Person.objects.get(user=self.request.user)

    def get_queryset(self):
        #filter based on the provided username
        person = self.kwargs.get('person', '')
        if person:
            return Clip.objects.filter(author__user__username=person)
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


class PersonListView(ListOnlyViewSet):
    """
    List only; DO NOT allow create Person -- do this through User
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class PersonDetailView(RetrieveOnlyView):
    """
    Retrieve a Person
    """
    lookup_field = 'username'
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)