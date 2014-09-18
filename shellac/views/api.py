from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework import viewsets

from django.contrib.auth.models import User
from shellac.models import Clip, Category
from shellac.serializers import CategorySerializer, UserSerializer, ClipSerializer

from shellac.permissions import IsOwnerOrReadOnly


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'categories': reverse('category-list', request=request, format=format),
        'clips': reverse('clip-list', request=request, format=format)
    })


class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ClipViewSet(viewsets.ModelViewSet):
    lookup_field = 'pk'
    queryset = Clip.objects.all()
    serializer_class = ClipSerializer

    def pre_save(self, obj):
        obj.author = self.request.user

    permission_classes = (IsOwnerOrReadOnly, )


class UserViewSet(viewsets.ModelViewSet):
    lookup_field = 'username'
    queryset = User.objects.all()
    serializer_class = UserSerializer

    #permission_classes = (permissions.IsAdminUser, )
