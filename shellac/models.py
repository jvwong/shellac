import os.path

from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save

from taggit.managers import TaggableManager
from shellac.fixtures import categories



## One-to-one model -- extend User to accomodate relationships
class PersonManager(models.Model):
    pass

## One-to-one model -- extend User to accomodate relationships
class Person(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    username = models.CharField(max_length=30, editable=False)
    joined = models.DateTimeField(auto_now_add=True, blank=True)
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
        super(Person, self).save(*args, **kwargs)


    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = "People"

    objects = PersonManager()

# Receive the post_save signal
@receiver(post_save, sender=User)
def on_user_save(sender, instance, created, raw, using, update_fields, **kwargs):
    if(created):
        p = Person(user=instance)
        p.save()


class Relationship(models.Model):
    #(A, B) where A is stored value; B is human-readable name
    RELATIONSHIP_FOLLOWING = 'following'
    RELATIONSHIP_BLOCKED = 'blocked'
    RELATIONSHIP_STATUSES = (
        (RELATIONSHIP_FOLLOWING, 'Following'),
        (RELATIONSHIP_BLOCKED, 'Blocked'),
    )

    from_person = models.ForeignKey(Person, related_name='from_people')
    to_person = models.ForeignKey(Person, related_name='to_people')
    created = models.DateTimeField(auto_now_add=True, blank=True)
    status = models.CharField(max_length=10, choices=RELATIONSHIP_STATUSES, default=RELATIONSHIP_FOLLOWING)
    private = models.BooleanField(default=False)


##c = Category.objects.create_category(title, description)
class CategoryManager(models.Manager):
    def create_category(self, title, description):
        category = self.create(title=title, description=description)
        return category

    def autopopulate(self):
        for category in categories.CATEGORIES:
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
    author = models.ForeignKey(Person, related_name="clips")

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
