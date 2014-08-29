from django.db import models
from taggit.managers import TaggableManager
from django.template.defaultfilters import slugify
import datetime
from django.conf import settings
from audiofield.fields import AudioField
import os.path
import json


##c = Category.objects.create_category(title, description)
class CategoryManager(models.Manager):
    def create_category(self, title, description):
        category = self.create(title=title, description=description)
        return category


class Category(models.Model):
    title = models.CharField(max_length=100, help_text='Maximum 100 characters.', unique=True)
    slug = models.SlugField(blank=False)
    description = models.TextField(blank=True)

    def clip_set(self):
        return self.clip_set.all()

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

    objects = CategoryManager()


##c = Clip.objects.create_clip(title, author)
class ClipManager(models.Manager):

    def create_clip(self, title, author):
        clip = self.create(title=title, author=author)
        return clip


class Clip(models.Model):
    PUBLIC_STATUS = 1
    PRIVATE_STATUS = 2

    STATUS_CHOICES = (
        (PUBLIC_STATUS, 'Public'),
        (PRIVATE_STATUS, 'Private')
    )

    title = models.CharField(max_length=250)
    author = models.ForeignKey("auth.User", related_name="clips")
    #related name is how we query in User i.e.  user[1].clips.all().count()

    ### Optional
    categories = models.ManyToManyField("shellac.Category", blank=True)
    tags = TaggableManager(blank=True)
    description = models.TextField(blank=True)
    brand = models.ImageField(upload_to='brands',
                              blank=True)

    ### Default
    plays = models.PositiveSmallIntegerField(default=0)
    rating = models.PositiveSmallIntegerField(default=0)
    status = models.IntegerField(choices=STATUS_CHOICES, default=PUBLIC_STATUS)

    ### Auto
    slug = models.SlugField(unique_for_date="created")
    created = models.DateTimeField(default=datetime.datetime.now, editable=False)

    #AUDIO
    # Add the audio field to your model -- required
    audio_file = AudioField(upload_to='sounds', blank=False,
                            ext_whitelist=(".mp3", ".wav", ".ogg"),
                            help_text=("Allowed type - .mp3, .wav, .ogg"))

    def audio_file_player(self):
        #audio player tag for admin
        if self.audio_file:
            file_url = settings.MEDIA_URL + str(self.audio_file)
            player_string = '<span class="audio_file">\
            <a href="%s">%s</a></span>' % (file_url, os.path.basename(self.audio_file.name))
            return player_string

    audio_file_player.allow_tags = True
    audio_file_player.short_description = 'Audio file player'

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Clip, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Clips"
        ordering = ['created']

    def __unicode__(self):
        return self.title

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return ('shellac_clip_detail', (), {'year': self.created.strftime("%Y"),
                                            'month':  self.created.strftime("%b").lower(),
                                            'day': self.created.strftime("%d"),
                                            'slug': self.slug})
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

    def serialize(self):
        from django.core import serializers
        data = serializers.serialize('json', [self,])
        struct = json.loads(data)
        data = json.dumps(struct[0])
        return data

    objects = ClipManager()





# Receive the pre_delete signal and delete the file associated with the model instance.
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver

@receiver(post_delete, sender=Clip)
def on_clip_delete(sender, instance, **kwargs):
    if instance.brand:
        if os.path.isfile(instance.brand.url):
            os.remove(instance.brand.url)
        # Pass false so ImageField doesn't save the model.
        instance.brand.delete(False)

    if instance.audio_file:
        if os.path.isfile(instance.audio_file.url):
            os.remove(instance.audio_file.url)
        # Pass false so ImageField doesn't save the model.
        instance.audio_file.delete(False)