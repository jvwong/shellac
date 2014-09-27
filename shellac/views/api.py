from urllib.parse import urlparse

from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import status

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.conf import settings

from shellac.models import Clip, Category, Person, Relationship
from shellac.serializers import CategorySerializer, UserSerializer, \
    ClipSerializer, PaginatedClipSerializer, \
    PersonSerializer, RelationshipSerializer
from shellac.permissions import IsAuthorOrReadOnly, UserIsOwnerOrAdmin, \
    UserIsAdminOrPost, RelationshipIsOwnerOrAdminOrReadOnly
from shellac.viewsets import DetailViewSet, ListViewSet


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'relationships': reverse('relationship-list', request=request, format=format),
        'people': reverse('person-list', request=request, format=format),
        'categories': reverse('category-list', request=request, format=format),
        'clips': reverse('clip-list', request=request, format=format)
    })


class RelationshipListViewSet(ListViewSet):
    serializer_class = RelationshipSerializer
    permission_classes = (permissions.IsAuthenticated,)

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
        This view will always create Relationship between the authenticated Person
        and the target regardless of the from_person field
        """
        o = urlparse(request.DATA.get('from_person'))
        path_elements = o.path.split('/')
        if request.user.person.username in path_elements or request.user.is_staff:
            return self.create(request, *args, **kwargs)
        return Response({'from_person': 'from_user does not match authenticated User'}, status=status.HTTP_400_BAD_REQUEST)


class RelationshipDetailViewSet(DetailViewSet):
    lookup_field = 'pk'
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer
    permission_classes = (permissions.IsAuthenticated, RelationshipIsOwnerOrAdminOrReadOnly)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ClipListViewSet(ListViewSet):
    lookup_field = 'pk'
    model = Clip
    serializer_class = ClipSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def pre_save(self, obj):
        obj.author = Person.objects.get(user=self.request.user)

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
class ClipListFollowingView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated, )
    paginate_by = 10
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):

        #Retrieve the User
        username = kwargs.get('username', None)
        qstatus = kwargs.get('status', None)
        if username is None:
            return Response({'invalid username'}, status.HTTP_400_BAD_REQUEST)
        if qstatus is None or qstatus != 'following':
            return Response({'invalid status'}, status.HTTP_400_BAD_REQUEST)

        #Retrieve following set (get_following) for Person corresponding to User
        user = get_object_or_404(User, username=username)
        following = user.person.get_following()
        qclips = Clip.objects.filter(author__in=following).order_by('-created')

        ## Get the url page_by parameter OR the settings value OR 50
        page_size = request.QUERY_PARAMS.get('page_size', settings.REST_FRAMEWORK.get('PAGINATE_BY', '50'))
        page = request.QUERY_PARAMS.get('page')
        paginator = Paginator(qclips, page_size)

        ###Extract a django Page object (clip_page) from the paginator.
        # Can call clip_page.object_list etc
        # Each Page has a 'paginator' attribute that can access parent data
        ### e.g. clips.paginator.count, clips.paginator.object_list
        try:
            clip_page = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            clip_page = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999),
            # deliver last page of results.
            clip_page = paginator.page(paginator.num_pages)

        serializer = PaginatedClipSerializer(clip_page, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClipDetailViewSet(DetailViewSet):
    lookup_field = 'pk'
    queryset = Clip.objects.all()
    serializer_class = ClipSerializer
    permission_classes = (permissions.IsAuthenticated, IsAuthorOrReadOnly)

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


class PersonListStatusView(generics.ListCreateAPIView):
    """
    List by status for User with username;
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):

        #Retrieve the User
        username = kwargs.get('username', None)
        qstatus = kwargs.get('status', None)
        #print(kwargs)
        if username is None:
            return Response({'invalid username'}, status.HTTP_400_BAD_REQUEST)
        if qstatus is None or qstatus not in Relationship.RELATIONSHIPS:
            return Response({'invalid status'}, status.HTTP_400_BAD_REQUEST)

        #Retrieve following set (get_following) for Person corresponding to User
        try:
            user = get_object_or_404(User, username=username)
            data = None

            if qstatus == 'following':
                data = user.person.get_following().order_by('username')

            elif qstatus == 'followers':
                data = user.person.get_followers().order_by('username')

            elif qstatus == 'friends':
                data = user.person.get_friends().order_by('username')

            ##Authenticated User can only view own blocked list
            elif qstatus == 'blocked':
                if user == request.user:
                    data = user.person.get_blocked().order_by('username')
                else:
                    data = Person.objects.none()

            if data is not None:
                serializer = PersonSerializer(data, many=True, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'Error: no data '}, status=status.HTTP_400_BAD_REQUEST)
        except IOError:
            return Response({'IOError'}, status.HTTP_400_BAD_REQUEST)


class PersonDetailView(generics.RetrieveAPIView):
    """
    Retrieve a Person
    """
    lookup_field = 'username'
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)