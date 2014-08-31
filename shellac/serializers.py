from django.forms import widgets
from rest_framework import serializers
from shellac.models import Category

class CategorySerializer(serializers.Serializer):
    id = serializers.Field() #untyped, read-only field
    title = serializers.CharField(max_length=100,
                                  help_text='Maximum 100 characters.',
                                  required=True)
    slug = serializers.SlugField(read_only=True)
    description = serializers.CharField(widget=widgets.Textarea,
                                        max_length=100000,
                                        required=False)

    """
    Create or update a new Category instance, given a dictionary
    of deserialized field values.
    Note that if we don't define this method, then deserializing
    data will simply return a dictionary of items.
    """
    def restore_object(self, attrs, instance=None):
        if instance:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.description = attrs.get('description', instance.description)
            return instance

        # Create new instance
        return Category(**attrs)