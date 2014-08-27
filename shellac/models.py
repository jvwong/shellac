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
    slug = models.SlugField(unique=True)
    description = models.TextField()

    class Meta:
        verbose_name_plural = "Categories"

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return "/category/%s/" % self.slug

    objects = CategoryManager()



##c = Clip.objects.create_clip(title, author)
class ClipManager(models.Manager):
    def create_clip(self, title, author, **kwargs):
        clip = self.create(title=title, author=author)

        audio_path = kwargs.pop('audio_path', None)
        brand_path = kwargs.pop('brand_path', None)

        from django.core.files import File
        import os
        if audio_path and os.path.exists(audio_path):
            with open(audio_path, 'rb') as f:
                clip.audio_field.save("tmp", File(f), save=True)

        if brand_path and os.path.exists(brand_path):
            with open(brand_path, 'rb') as f:
                clip.brand.save("tmp", File(f), save=True)

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
                              default='settings.STATIC_ROOT/shellac/assets/seventyEight.png',
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

    def getStatus(self):
        if self.status == Clip.PUBLIC_STATUS:
            return "PUBLIC"
        return "PRIVATE"


    def getCreated(self):
        return " ".join([self.created.strftime("%b"), self.created.strftime("%d"), self.created.strftime("%Y")])


    def toJSON(self):
        return json.dumps({'title': self.title,
                           'author': self.author.username,
                           'categories': '',
                           'description': '',
                           'brand': self.brand.url,
                           'plays': self.plays,
                           'rating': self.rating,
                           'status': self.getStatus(),
                           'created': self.getCreated()
                           })

    objects = ClipManager()





# Receive the pre_delete signal and delete the file associated with the model instance.
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver

@receiver(post_delete, sender=Clip)
def on_clip_delete(sender, instance, **kwargs):
    if instance.brand:
        if os.path.isfile(instance.brand.name):
            os.remove(instance.brand.name)
        # Pass false so ImageField doesn't save the model.
        instance.brand.delete(False)


