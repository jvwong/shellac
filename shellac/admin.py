import os.path
from django.contrib import admin
from shellac.models import Category, Clip, Person, Relationship, Playlist, Track

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title',)
    ordering = ['title']
    prepopulated_fields = {'slug': ['title']}
admin.site.register(Category, CategoryAdmin)


class ClipInline(admin.StackedInline):
    model = Clip
    fk_name = 'author'
    #raw_id_fields = ('from_person', 'to_person')
    extra = 1
    readonly_fields = ('status',)
    fieldsets = (
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('title', 'author', 'categories', 'tags', 'status',
                       'description', 'brand', 'audio_file', 'created')
        }),
    )

class RelationshipInline(admin.StackedInline):
    model = Relationship
    fk_name = 'from_person'
    #raw_id_fields = ('from_person', 'to_person')
    extra = 1

    fieldsets = (
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('from_person', 'to_person', 'status', 'private')
        }),
    )

class PersonAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user', 'joined']
    list_filter = ['joined']
    search_fields = ['user__username']
    readonly_fields = ('user',)
    inlines = (RelationshipInline, ClipInline)

# Re-register UserAdmin
admin.site.register(Person, PersonAdmin)


class TrackInline(admin.StackedInline):
    model = Track
    fk_name = 'playlist'
    #raw_id_fields = ('playlist', 'clip')
    extra = 1
    fieldsets = (
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('clip', 'position', 'playlist')
        }),
    )

class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['title', 'person']
    list_filter = ['person']
    search_fields = ['person__username']
    ordering = ['-updated']
    readonly_fields = ['created']
    prepopulated_fields = {'slug': ['title']}
    inlines = (TrackInline,)
admin.site.register(Playlist, PlaylistAdmin)
