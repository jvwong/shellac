from rest_framework import status
from rest_framework.response import Response
from shellac.models import Category, Clip
from shellac.serializers import CategorySerializer, UserSerializer, ClipSerializer
from rest_framework.views import APIView
from django.http import Http404
from rest_framework import permissions

### api /
class ClipList(APIView):
    """
    List all Categories, or create a new one.
    """
    def get(self, request, format=None):
        clips = Clip.objects.all()
        serializer = ClipSerializer(clips, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print("in ClipList POST")
        print(request.user.username)
        print(request.DATA)
        serializer = ClipSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def pre_save(self, obj):
        obj.author = self.request.user

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class ClipDetail(APIView):
    """
    Retrieve, update or delete a clip instance.
    """
    def get_object(self, slug):
        try:
            return Clip.objects.get(slug=slug)
        except Clip.DoesNotExist:
            raise Http404

    def get(self, request, slug, format=None):
        clip = self.get_object(slug)
        serializer = ClipSerializer(clip)
        return Response(serializer.data)

    def put(self, request, slug, format=None):
        clip = self.get_object(slug)
        serializer = ClipSerializer(clip, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, format=None):
        clip = self.get_object(slug)
        clip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def pre_save(self, obj):
        obj.author = self.request.user

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class CategoryList(APIView):
    """
    List all Categories, or create a new one.
    """
    def get(self, request, format=None):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = CategorySerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetail(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, slug):
        try:
            return Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            raise Http404

    def get(self, request, slug, format=None):
        category = self.get_object(slug)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, slug, format=None):
        category = self.get_object(slug)
        serializer = CategorySerializer(category, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, format=None):
        category = self.get_object(slug)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



from django.contrib.auth.models import User
class UserList(APIView):
    """
    List all Users, or create a new one.
    """
    def get(self, request, format=None):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetail(APIView):
    """
    Retrieve a user instance.
    """
    def get_object(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, username, format=None):
        user = self.get_object(username)
        serializer = UserSerializer(user)
        return Response(serializer.data)



