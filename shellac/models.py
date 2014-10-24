import os.path
import datetime
from uuid import uuid4

from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save

from taggit.managers import TaggableManager
from image.fields import ThumbnailImageField
from audio.fields import AudioField

from shellac import util

def path_and_rename(path):
    def wrapper(instance, filename):
        date_prefix = (datetime.datetime.now()).strftime('%Y/%m/%d')
        path_date = os.path.join(path, date_prefix)

        ##May need to guard against weird input (non file)
        fname = os.path.split(filename)[1]

        ##just get the extension
        ext = fname.split('.')[-1]

        # set filename as name + random string
        fn = '{}.{}'.format(uuid4().hex, ext)

        # return the whole path to the file
        return os.path.join(path_date, fn)

    return wrapper

##########################################################################################
###                             BEGIN Class Person                                     ###
##########################################################################################
class PersonManager(models.Model):
    pass

## One-to-one model -- extend User to accomodate relationships
APP_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_AVATAR = os.path.abspath(os.path.join(APP_DIR, './static/shellac/assets/avatar.jpeg'))
class Person(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    username = models.CharField(max_length=30, editable=False)
    joined = models.DateTimeField(auto_now_add=True, blank=True)
    avatar = models.ImageField(upload_to=path_and_rename('avatars'), blank=True)
    avatar_thumb = ThumbnailImageField(upload_to=path_and_rename('avatars'), blank=True, editable=False)

    relationships = models.ManyToManyField('self',
                                           through='Relationship',
                                           symmetrical=False,
                                           related_name='related_to')

    ##create a relationship self --> person with status
    ##May need to disallow circular references, i.e. self == person
    #Returns a tuple of (object, created)
    def add_relationship(self, person, status):
        relationship, created = Relationship.objects.get_or_create(
            from_person=self,
            to_person=person,
            status=status
        )
        return relationship

    ##remove a relationship self --> person with status
    def remove_relationship(self, person, status):
        Relationship.objects.filter(
            from_person=self,
            to_person=person,
            status=status
        ).delete()
        return

    ##Query Relationships model
    def get_relationships(self, status):
        return self.relationships.filter(
            # This deserves some explanation. self.relationships gives you a ManyRelatedManager
            # object that references all the Person objects with Relationships with self
            # Now remember this is asymmetric; If we call p1.add_relationship(p2, status)
            # there is no Relationship from p2 back to p1.
            # 'to_people' is a reference in other Person objects to Relationship objects
            # where to_person is referencing the Person
            ## here we search these Relationship objects for status and from_person fields
            to_people__status=status,
            to_people__from_person=self
        )

    def get_following(self):
        return self.get_relationships(Relationship.RELATIONSHIP_FOLLOWING)

    def get_blocked(self):
        return self.get_relationships(Relationship.RELATIONSHIP_BLOCKED)


    ##Query Relationships model
    def get_related_to(self, status):
        return self.related_to.filter(
            # This deserves some MORE explanation. self.related_to gives you a ManyRelatedManager
            # objects that references all Person objects with which there is a reference back to self
            # So concretely, self.related_to can access Relationship using from_people
            from_people__status=status,
            from_people__to_person=self,
        )

    def get_followers(self):
        return self.get_related_to(Relationship.RELATIONSHIP_FOLLOWING)

    def get_friends(self):
        return self.relationships.filter(
            to_people__status=Relationship.RELATIONSHIP_FOLLOWING,
            to_people__from_person=self,
            from_people__status=Relationship.RELATIONSHIP_FOLLOWING,
            from_people__to_person=self
        )

    def save(self, *args, **kwargs):
        self.username = self.user.username
        if self.avatar:
           util.squarer(self.avatar, self.avatar_thumb, self.avatar.name)
        super(Person, self).save(*args, **kwargs)


    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = "People"

    def get_absolute_url(self):
        return ('shellac_profile', (), { 'username': self.username })
    get_absolute_url = models.permalink(get_absolute_url)

    objects = PersonManager()


@receiver(post_delete, sender=Person)
def on_person_delete(sender, instance, **kwargs):
    if instance.avatar:
        if os.path.isfile(instance.avatar.url):
            os.remove(instance.avatar.url)
        # Pass false so ImageField doesn't save the model.
        instance.avatar.delete(False)

    if instance.avatar_thumb:
        if os.path.isfile(instance.avatar_thumb.url):
            os.remove(instance.avatar_thumb.url)
        # Pass false so ImageField doesn't save the model.
        instance.avatar_thumb.delete(False)


##########################################################################################
###                             BEGIN User Signals                                     ###
##########################################################################################
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
# Receive the post_save signal
@receiver(post_save, sender=User)
def on_user_save(sender, instance, created, raw, using, update_fields, **kwargs):

    if created:
        #create a Person
        p = Person(user=instance)
        p.save()

        #create a default Playlist for this Person
        playlist, created = Playlist.objects.get_or_create(person=p, title='default')

        # #Assign groups -- Contributors default
        # try:
        #     contributor = Group.objects.get(name='Contributor')
        #     listener = Group.objects.get(name='Listener')
        # except ObjectDoesNotExist:
        #     # group should exist, but this is just for safety's sake,
        #     # it case the improbable should happen
        #     print('ObjectDoesNotExist: Groups')
        # else:
        #     instance.groups = [user]


##########################################################################################
###                             BEGIN Class Playlist                                   ###
##########################################################################################
class PlaylistManager(models.Manager):
    def create_playlist(self, person, title):
        playlist = self.create(person=person, title=title)
        return playlist

def datetime_title_default():
    now = datetime.datetime.now()
    return now.strftime("%Y_%m_%d_%H%M%S")


class Playlist(models.Model):

    PATCHABLE = ('title',
                 'description')

    title = models.CharField(max_length=50, default=datetime_title_default, help_text="Limit 50 characters")
    description = models.TextField(max_length=2000, blank=True, help_text="Limit 2000 characters")
    person = models.ForeignKey(Person, related_name="playlists", related_query_name="playlist")

    ### Auto
    slug = models.SlugField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Playlist, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('person', 'title')
        verbose_name_plural = "playlists"
        ordering = ['-updated']

    def __unicode__(self):
        return self.title

    def __str__(self):
        return self.title

    objects = PlaylistManager()


##########################################################################################
###                             BEGIN Class Relationship                               ###
##########################################################################################
class Relationship(models.Model):
    #(A, B) where A is stored value; B is human-readable name
    RELATIONSHIP_FOLLOWING = 'following'
    RELATIONSHIP_BLOCKED = 'blocked'
    RELATIONSHIP_STATUSES = (
        (RELATIONSHIP_FOLLOWING, 'Following'),
        (RELATIONSHIP_BLOCKED, 'Blocked'),
    )
    RELATIONSHIPS = ('following', 'followers', 'friends', 'blocked')

    from_person = models.ForeignKey(Person, related_name='from_people')
    to_person = models.ForeignKey(Person, related_name='to_people')
    created = models.DateTimeField(auto_now_add=True, blank=True)
    status = models.CharField(max_length=10, choices=RELATIONSHIP_STATUSES, default=RELATIONSHIP_FOLLOWING)
    private = models.BooleanField(default=False)


##########################################################################################
###                             BEGIN Class Category                                   ###
##########################################################################################
class CategoryManager(models.Manager):
    def create_category(self, title, description):
        category = self.create(title=title, description=description)
        return category


class Category(models.Model):
    title = models.CharField(max_length=100,
                             blank=False,
                             help_text='Maximum 100 characters.',
                             unique=True)
    ##editable false means it won't be showed in admin and not validated
    slug = models.SlugField(blank=True)
    description = models.TextField(blank=True)

    def clip_set(self):
        return self.clips.all()

    def save(self, *args, **kwargs):
        self.title = self.title.upper()
        self.slug = slugify(self.title)
        super(Category, self).save(*args, **kwargs)

    class Meta:
        ordering = ['title']
        verbose_name_plural = "Categories"

    def __unicode__(self):
        return self.title

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return ('shellac_category', (), {'slug': self.slug})
    get_absolute_url = models.permalink(get_absolute_url)

    objects = CategoryManager()


##########################################################################################
###                             BEGIN Class Clip                                       ###
##########################################################################################
class ClipManager(models.Manager):
    def create_clip(self, title, author):
        clip = self.create(title=title, author=author)
        return clip


class Clip(models.Model):
    PATCHABLE = ('title',
                 'categories',
                 'tags',
                 'description',
                 'brand',
                 'plays',
                 'rating',
                 'status',
                 'audio_file')

    PUBLIC_STATUS = 1
    PRIVATE_STATUS = 2

    STATUS_CHOICES = (
        (PUBLIC_STATUS, 'Public'),
        (PRIVATE_STATUS, 'Private')
    )

    title = models.CharField(max_length=50, help_text=("Limit 50 characters"), unique_for_date='created')
    author = models.ForeignKey(Person, related_name="clips")

    ### Optional
    categories = models.ManyToManyField("shellac.Category", related_name="clips", blank=True)
    tags = TaggableManager(blank=True, help_text=("Comma separated list"))
    description = models.TextField(max_length=2000, blank=True, help_text=("Limit 2000 characters"))

    ###upload to subdirectory with user id prefixed
    brand = models.ImageField(upload_to=path_and_rename('brands'), blank=True, help_text=("Images will be cropped as squares"))
    brand_thumb = ThumbnailImageField(upload_to=path_and_rename('brands'), blank=True, editable=False)

    ### Default
    plays = models.PositiveSmallIntegerField(default=0, blank=True)
    rating = models.PositiveSmallIntegerField(default=0, blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=PUBLIC_STATUS)

    ### Auto
    slug = models.SlugField(blank=True)
    created = models.DateTimeField(default=datetime.datetime.now, blank=True)

    #AUDIO
    # Add the audio field to your model -- required
    audio_file = AudioField(upload_to=path_and_rename('sounds'), blank=False, help_text=("Allowed type - .mp3, .wav, .ogg"))

    def save(self, *args, **kwargs):
        if self.pk is not None:
            orig = Clip.objects.get(pk=self.pk)
            if orig.brand != self.brand:
                filename = os.path.split(self.brand.name)[1]
                util.squarer(self.brand, self.brand_thumb, filename)

        self.slug = slugify(self.title)
        super(Clip, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('author', 'title', 'created')
        verbose_name_plural = "Clips"
        ordering = ['created']

    def __unicode__(self):
        return self.title

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return ('shellac_clip_detail', (), {'pk': self.pk})
    get_absolute_url = models.permalink(get_absolute_url)

    def getStatusPretty(self):
        if self.status == Clip.PUBLIC_STATUS:
            return "PUBLIC"
        return "PRIVATE"


    def getCreatedPretty(self):
        return " ".join([self.created.strftime("%b"), self.created.strftime("%d"), self.created.strftime("%Y")])

    def getCategoriesPretty(self):
        cats = [c.title for c in list(self.categories.all())]
        return cats

    objects = ClipManager()


@receiver(post_delete, sender=Clip)
def on_clip_delete(sender, instance, **kwargs):
    if instance.brand:
        if os.path.isfile(instance.brand.url):
            os.remove(instance.brand.url)
        # Pass false so ImageField doesn't save the model.
        instance.brand.delete(False)

    if instance.brand_thumb:
        if os.path.isfile(instance.brand_thumb.url):
            os.remove(instance.brand_thumb.url)
        # Pass false so ImageField doesn't save the model.
        instance.brand_thumb.delete(False)


    if instance.audio_file:
        if os.path.isfile(instance.audio_file.url):
            os.remove(instance.audio_file.url)
        # Pass false so ImageField doesn't save the model.
        instance.audio_file.delete(False)

##########################################################################################
###                             BEGIN Class Track                                      ###
##########################################################################################
class TrackManager(models.Manager):
    def create_track(self, clip, playlist):
        track = self.create(clip=clip, playlist=playlist)
        return track

class Track(models.Model):
    PATCHABLE = ('position',
                 'playlist')

    clip = models.ForeignKey(Clip, related_name="tracks", related_query_name="track")
    position = models.IntegerField(default=0)
    playlist = models.ForeignKey(Playlist, related_name="tracks", related_query_name="track")

    #Auto
    added = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super(Track, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "tracks"
        ordering = ['-added']

    def __unicode__(self):
        return self.clip.title

    def __str__(self):
        return self.clip.title

    objects = TrackManager()