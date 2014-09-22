import os.path

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from shellac.models import Category, Clip, Person, Relationship

def custom_delete_selected(modeladmin, request, queryset):
    #custom delete code
    n = queryset.count()
    for i in queryset:
        if i.audio_file:
            if os.path.exists(i.audio_file.path):
                os.remove(i.audio_file.path)
        i.delete()
    modeladmin.message_user(request, ("Successfully deleted %d audio files.") % n)
custom_delete_selected.short_description = "Delete selected items and content"


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title',)
    ordering = ['title']
    prepopulated_fields = {'slug': ['title']}


class ClipAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ["title"]}
    # list_display = ['__unicode__', 'audio_file_player']
    list_display = ['__unicode__']
    actions = [custom_delete_selected]

    def get_actions(self, request):
        actions = super(ClipAdmin, self).get_actions(request)
        del actions['delete_selected']
        return actions

admin.site.register(Category, CategoryAdmin)
admin.site.register(Clip, ClipAdmin)


class RelationshipInline(admin.TabularInline):
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
    inlines = (RelationshipInline,)

# Re-register UserAdmin
admin.site.register(Person, PersonAdmin)
