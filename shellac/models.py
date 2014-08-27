from django.db import models
from taggit.managers import TaggableManager
from django.template.defaultfilters import slugify
import datetime
from django.conf import settings
from audiofield.fields import AudioField
import os.path
import json

#Useage
##c = Category.objects.create_category(title, description)
class CategoryManager(models.Manager):
    def create_category(self, title, description):
        category = self.create(title=title, description=description)
        return category


class Category(models.Model):
    title = models.CharField(max_length=250)
    slug = models.SlugField(unique=True, editable=False)
    description = models.TextField()

    class Meta:
        verbose_name_plural = "Categories"

    def __unicode__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Category, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return "/category/%s/" % self.slug

    objects = CategoryManager()



from django.core.files import File
import os
def setFileField(instance_field, path):
    if os.path.isfile(path):
        with open(path, 'rb') as f:
            instance_field.save("", File(f), save=False)


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
    # Add the audio field to your model
    audio_file = AudioField(upload_to='sounds', blank=True,
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

        # set default Image and File fields
        if not self.brand:
            path = settings.STATIC_ROOT + "/shellac/assets/seventyEight.png"
            setFileField(self.brand, path)

        if not self.audio_file:
            path = settings.STATIC_ROOT + "/shellac/assets/song.mp3"
            setFileField(self.audio_file, path)

        super(Clip, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Clips"
        ordering = ['created']

    def __unicode__(self):
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

    def toJSON(self):
        return json.dumps({'title': self.title,
                           'author': self.author.username,
                           'categories': self.getCategoriesPretty(),
                           'description': self.description,
                           'brand': self.brand.url,
                           'audio_file': self.audio_file.url,
                           'plays': self.plays,
                           'rating': self.rating,
                           'status': self.getStatusPretty(),
                           'created': self.getCreatedPretty()
                           })

    objects = ClipManager()





# Receive the pre_delete signal and delete the file associated with the model instance.
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver

@receiver(post_delete, sender=Clip)
def on_clip_delete(sender, instance, **kwargs):
    if instance.brand:
        # if os.path.isfile(instance.brand.name):
        os.remove(instance.brand.name)
        # Pass false so ImageField doesn't save the model.
        instance.brand.delete(False)


