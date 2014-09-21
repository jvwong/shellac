from django.db import models
from taggit.managers import TaggableManager
from django.template.defaultfilters import slugify
import os.path
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    following = models.ManyToManyField('self', related_name='followers')


CATEGORIES = (
    'arts',
    'business',
    'food',
    'health',
    'music',
    'opinion',
    'politics',
    'real estate',
    'science',
    'sports',
    'style',
    'technology',
    'travel',
    'money',
    'economics',
    'comedy'
)

##c = Category.objects.create_category(title, description)
class CategoryManager(models.Manager):
    def create_category(self, title, description):
        category = self.create(title=title, description=description)
        return category

    def autopopulate(self):
        for category in CATEGORIES:
            self.create_category(title=category, description=category)


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
    categories = models.ManyToManyField("shellac.Category", related_name="clips", blank=True)
    tags = TaggableManager(blank=True)
    description = models.TextField(blank=True)

    ###upload to subdirectory with user id prefixed
    ### -- /media/brands/<userid>/filename
    brand = models.ImageField(upload_to='brands/%Y/%m/%d',
                              blank=True)

    ### Default
    plays = models.PositiveSmallIntegerField(default=0, editable=False)
    rating = models.PositiveSmallIntegerField(default=0, editable=False)
    status = models.IntegerField(choices=STATUS_CHOICES, default=PUBLIC_STATUS)

    ### Auto
    slug = models.SlugField(blank=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)

    #AUDIO
    # Add the audio field to your model -- required
    audio_file = models.FileField(upload_to='sounds/%Y/%m/%d', blank=False,
                            help_text=("Allowed type - .mp3, .wav, .ogg"))

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Clip, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('author', 'title')
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
