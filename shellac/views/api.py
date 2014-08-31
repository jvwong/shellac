from rest_framework import status
from rest_framework.response import Response
from shellac.models import Category
from shellac.serializers import CategorySerializer
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.compat import BytesIO
from django.http import Http404
import json

### api /
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


