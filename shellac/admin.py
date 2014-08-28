from django.contrib import admin
from shellac.models import Category, Clip
import os.path

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
    list_display = ['__unicode__', 'audio_file_player']
    actions = [custom_delete_selected]

    def get_actions(self, request):
        actions = super(ClipAdmin, self).get_actions(request)
        del actions['delete_selected']
        return actions

admin.site.register(Category, CategoryAdmin)
admin.site.register(Clip, ClipAdmin)






