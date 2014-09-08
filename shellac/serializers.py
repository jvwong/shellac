from rest_framework import serializers
from shellac.models import Category, Clip
from django.contrib.auth.models import User
from django.utils.text import slugify


class UserSerializer(serializers.ModelSerializer):
    # clips = serializers.HyperlinkedRelatedField(many=True,
    #                                             lookup_field='pk',
    #                                             view_name='shellac_api_clip_detail')

    class Meta:
        # lookup_field = 'username'
        model = User
        fields = ('id', 'username', 'email', 'clips')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title', 'slug', 'description', 'clips')
        read_only_fields = ('clips',)

    def restore_object(self, attrs, instance=None):
        # instance will be None, unless the serializer was instantiated with an
        # existing model instance to be updated, using the instance=... argument
        if instance is not None:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            return instance

        # Create new instance
        # attrs.pop('clips', None)
        return Category(**attrs)


class ClipSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField('get_owner')
    categories = serializers.SlugRelatedField(many=True,
                                              slug_field='slug', read_only=False)

    class Meta:
        model = Clip
        fields = ('id', 'title', 'author', 'description', 'categories',
                  'brand', 'plays', 'rating', 'status', 'slug',
                  'audio_file', 'created', 'owner')
        # read_only_fields = ('categories',)

    def get_owner(self, obj):
        return obj.author.username

    def restore_object(self, attrs, instance=None):
        #print(attrs)
        # instance will be None, unless the serializer was instantiated with an
        # existing model instance to be updated, using the instance=... argument
        if instance is not None:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            instance.brand = attrs.get('brand', instance.brand)
            instance.plays = attrs.get('plays', instance.plays)
            instance.rating = attrs.get('rating', instance.rating)
            instance.status = attrs.get('status', instance.status)
            instance.slug = slugify(attrs.get('title', instance.title))
            instance.audio_file = attrs.get('audio_file', instance.audio_file)
            instance.categories = attrs.get('categories', instance.categories)
            return instance

        # Create new instance
        attrs.pop('categories', None)
        return Clip(**attrs)