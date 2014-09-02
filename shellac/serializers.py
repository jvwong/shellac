from django.forms import widgets
from rest_framework import serializers
from shellac.models import Category, Clip
from django.contrib.auth.models import User
from django.utils.text import slugify
import datetime

class UserSerializer(serializers.ModelSerializer):
    clips = serializers.PrimaryKeyRelatedField(many=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'clips')


class CategorySerializer(serializers.ModelSerializer):
    clips = serializers.PrimaryKeyRelatedField(many=True)

    class Meta:
        model = Category
        fields = ('id', 'title', 'slug', 'description', 'clips')

    def restore_object(self, attrs, instance=None):
        # instance will be None, unless the serializer was instantiated with an
        # existing model instance to be updated, using the instance=... argument
        if instance:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            return instance

        # Create new instance
        return Category(**attrs)


PUBLIC_STATUS = 1
PRIVATE_STATUS = 2

STATUS_CHOICES = (
    (PUBLIC_STATUS, 'Public'),
    (PRIVATE_STATUS, 'Private')
)

class ClipSerializer(serializers.ModelSerializer):
    author = serializers.Field(source='author.username')
    categories = serializers.SlugRelatedField(many=True,
                                              read_only=True,
                                              slug_field='slug')
    audio_file = serializers.Field(source='audio_file.url')

    class Meta:
        model = Clip
        fields = ('id', 'title', 'author', 'categories', 'description', 'brand', 'plays', 'rating', 'status', 'slug', 'created', 'audio_file')


# class ClipSerializer(serializers.Serializer):
#
#     id = serializers.Field()
#     title = serializers.CharField(max_length=250,
#                                   required=True)
#     author = serializers.Field(source='author.username')
#
#     ### Optional
#     # categories = serializers.SlugRelatedField(many=True,
#     #                                           slug_field='slug',
#     #                                           required=False)
#     #tags = TaggableManager(blank=True)
#     description = serializers.CharField(widget=widgets.Textarea,
#                                         max_length=100000,
#                                         required=False)
#     brand = serializers.ImageField(required=False)
#
#
#     ### Defaulted
#     plays = serializers.IntegerField(default=0)
#     rating = serializers.IntegerField(default=0)
#     status = serializers.ChoiceField(choices=STATUS_CHOICES,
#                                      default=PUBLIC_STATUS)
#
#     ### Auto
#     slug = serializers.SlugField(read_only=True)
#     created = serializers.DateTimeField(read_only=True)
#
#     #AUDIO
#     # Add the audio field to your model -- required
#     audio_file = serializers.FileField(allow_empty_file=False)
#
#
#     """
#     Create or update a new Clip instance, given a dictionary
#     of deserialized field values.
#     Note that if we don't define this method, then deserializing
#     data will simply return a dictionary of items.
#     """
#     def restore_object(self, attrs, instance=None):
#         if instance:
#             # Update existing instance
#             instance.title = attrs.get('title', instance.title)
#             #instance.author = User.objects.get(username=attrs.get('author', instance.author))
#             instance.description = attrs.get('description', instance.description)
#             instance.plays = attrs.get('plays', instance.plays)
#             instance.rating = attrs.get('rating', instance.rating)
#             instance.status = attrs.get('status', instance.status)
#             instance.created = attrs.get('created ', instance.created)
#             return instance
#
#         # Create new instance
#         return Clip(**attrs)