from rest_framework import serializers
from shellac.models import Category, Clip, Person, Relationship
from django.contrib.auth.models import User
from django.utils.text import slugify


class RelationshipSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name='relationship-detail',
        lookup_field='pk'
    )

    class Meta:
        lookup_field = 'username'
        model = Relationship
        fields = ('url', 'id', 'from_person', 'to_person',  'created', 'status', 'private')


class PersonSerializer(serializers.HyperlinkedModelSerializer):
    first_name = serializers.Field(source='user.first_name')
    last_name = serializers.Field(source='user.last_name')
    clips = serializers.HyperlinkedRelatedField(many=True,
                                                lookup_field='pk',
                                                view_name='clip-detail')
    relationships = RelationshipSerializer(source='from_people', many=True)

    class Meta:
        lookup_field = 'username'
        model = Person
        fields = ('url', 'username', 'first_name', 'last_name', 'joined',
                  'clips', 'relationships')


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
    author = serializers.HyperlinkedRelatedField(lookup_field='username',
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