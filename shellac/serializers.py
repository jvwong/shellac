from django.contrib.auth.models import User
from django.utils.text import slugify

from rest_framework import serializers
from rest_framework import pagination

from shellac.models import Category, Clip, Person, Relationship, Playlist, Track


class PlaylistSerializer(serializers.HyperlinkedModelSerializer):
    person = serializers.HyperlinkedRelatedField(many=False,
                                                 lookup_field='username',
                                                 view_name='person-detail')

    tracks = serializers.HyperlinkedRelatedField(many=True,
                                                 lookup_field='pk',
                                                 view_name='track-detail')

    class Meta:
        lookup_field = 'pk'
        model = Playlist
        fields = ('url', 'id', 'title', 'description', 'person', 'tracks',
                  'slug', 'created', 'updated')


class TrackSerializer(serializers.HyperlinkedModelSerializer):
    clip = serializers.HyperlinkedRelatedField(many=False,
                                               lookup_field='pk',
                                               view_name='clip-detail')
    playlist = serializers.HyperlinkedRelatedField(many=False,
                                                   lookup_field='pk',
                                                   view_name='playlist-detail')

    playlist_person = serializers.Field(source='playlist.person.username')
    clip_author = serializers.Field(source='clip.author.username')

    class Meta:
        lookup_field = 'pk'
        model = Track
        fields = ('url', 'id', 'clip', 'position', 'playlist', 'added',
                  'playlist_person', 'clip_author')


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
    avatar_url = serializers.SerializerMethodField('get_avatar_url')
    clips = serializers.HyperlinkedRelatedField(many=True,
                                                lookup_field='pk',
                                                view_name='clip-detail')
    playlists = serializers.HyperlinkedRelatedField(many=True,
                                                    lookup_field='pk',
                                                    view_name='playlist-detail')
    relationships = RelationshipSerializer(source='from_people', many=True)

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        else:
            return ""

    class Meta:
        lookup_field = 'username'
        model = Person
        fields = ('url', 'username', 'title', 'description', 'avatar_url',
                  'joined', 'clips', 'relationships', 'playlists')


class PaginatedPersonSerializer(pagination.PaginationSerializer):
    """
    Serializes page objects of user querysets.
    """
    class Meta:
        object_serializer_class = PersonSerializer


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
    owner = serializers.Field(source='author.title')
    author = serializers.HyperlinkedRelatedField(lookup_field='username',
                                                 view_name='person-detail')
    author_username = serializers.Field(source='author.username')

    categories = serializers.HyperlinkedRelatedField(many=True,
                                                     lookup_field='slug',
                                                     view_name='category-detail')
    audio_file = serializers.FileField(max_length=250, allow_empty_file=False)
    audio_file_url = serializers.SerializerMethodField('get_audio_file_url')

    brand_url = serializers.SerializerMethodField('get_brand_url')

    tags = serializers.Field(source='tags.names')

    def get_brand_url(self, obj):
        if obj.brand:
            return obj.brand.url
        elif obj.author.avatar:
            return obj.author.avatar.url
        else:
            return ""

    def get_audio_file_url(self, obj):
        if obj.audio_file:
            return obj.audio_file.url
        return ""

    class Meta:
        lookup_field = 'pk'
        model = Clip
        fields = ('url', 'id', 'title', 'author', 'author_username', 'description', 'categories', 'tags',
                  'brand', 'brand_url', 'plays', 'rating', 'status', 'slug',
                  'audio_file', 'audio_file_url', 'created', 'owner')
        # read_only_fields = ('categories',)

    def restore_object(self, attrs, instance=None):
        if instance is not None:
            #print(attrs)
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            instance.brand = attrs.get('brand', instance.brand)
            instance.plays = attrs.get('plays', instance.plays)
            instance.rating = attrs.get('rating', instance.rating)
            instance.status = attrs.get('status', instance.status)
            instance.slug = slugify(attrs.get('title', instance.title))
            instance.audio_file = attrs.get('audio_file', instance.audio_file)
            instance.categories = attrs.get('categories', instance.categories.all())
            return instance

        # Create new instance
        attrs.pop('categories', None)
        return Clip(**attrs)


class PaginatedClipSerializer(pagination.PaginationSerializer):
    """
    Serializes page objects of user querysets.
    """
    class Meta:
        object_serializer_class = ClipSerializer