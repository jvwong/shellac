from rest_framework import serializers
from shellac.models import Category, Clip, Person
from django.contrib.auth.models import User
from django.utils.text import slugify

class PersonSerializer(serializers.HyperlinkedModelSerializer):
    clips = serializers.HyperlinkedRelatedField(many=True,
                                                lookup_field='pk',
                                                view_name='clip-detail')
    user = serializers.HyperlinkedRelatedField(many=False,
                                                lookup_field='username',
                                                view_name='user-detail')
    class Meta:
        lookup_field = 'user'
        model = Person
        fields = ('url', 'user', 'joined', 'clips')



class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        lookup_field = 'username'
        model = User
        fields = ('url', 'id', 'username', 'email')


class CategorySerializer(serializers.HyperlinkedModelSerializer):
    clips = serializers.HyperlinkedRelatedField(many=True,
                                                lookup_field='pk',
                                                view_name='clip-detail')

    class Meta:
        lookup_field = 'slug'
        model = Category
        fields = ('url', 'id', 'title', 'slug', 'description', 'clips')
        # read_only_fields = ('clips',)

    def restore_object(self, attrs, instance=None):
        # instance will be None, unless the serializer was instantiated with an
        # existing model instance to be updated, using the instance=... argument
        # print("attrs: ", attrs)
        if instance is not None:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            return instance

        # Create new instance
        attrs.pop('clips', None)
        return Category(**attrs)


class ClipSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.Field(source='author.user.username')
    author = serializers.HyperlinkedRelatedField(lookup_field='user',
                                                 view_name='person-detail')
    categories = serializers.HyperlinkedRelatedField(many=True,
                                                     lookup_field='slug',
                                                     view_name='category-detail')

    class Meta:
        lookup_field = 'pk'
        model = Clip
        fields = ('url', 'id', 'title', 'author', 'description', 'categories',
                  'brand', 'plays', 'rating', 'status', 'slug',
                  'audio_file', 'created', 'owner')
        # read_only_fields = ('categories',)

    def restore_object(self, attrs, instance=None):
        #print("restoration: %s" % (attrs,))
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