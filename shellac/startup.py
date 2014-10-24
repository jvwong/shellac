# from django.db.models import signals
# from django.http import HttpResponseRedirect
# from django.contrib.auth.models import Group, Permission
# from django.contrib.admin.views.decorators import staff_member_required
#
# from shellac.models import Category
#
# ### Category list
# CATEGORIES = (
#     'nascar',
#     'tennis',
#     'track & field',
#     'golf',
#     'boxing',
#     'mixed martial arts',
#     'wrestling',
#     'horse racing',
#     'ncaa football',
#     'ncaa basketball',
#     'nba',
#     'nhl',
#     'nfl',
#     'mls',
#     'mlb',
#     'baseball',
#     'rugby',
#     'lacrosse',
#     'cricket',
#     'soccer',
#     'champions league',
#     'world cup soccer',
#     'pop culture',
#     'in the news',
#     'business',
#     'olympics'
# )
#
# @staff_member_required
# def shellac_init_category(request, *args, **kwargs):
#     for category in CATEGORIES:
#         Category.objects.create_category(title=category, description=category)
#     return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
#
#
#
# shellac_group_permissions = {
#     "Contributor": [
#         "add_clip",
#         "change_clip",
#         "delete_clip"
#     ],
#     "Listener": []
# }
#
# ##Groups
# @staff_member_required
# def shellac_init_groups(request, *args, **kwargs):
#     #Loop over the types of groups
#     for type in shellac_group_permissions:
#         group, created = Group.objects.get_or_create(name=type)
#
#         #Loop over the permissions codenames in each groups.
#         # Assume these codenames and Permissions exist
#         for codename in shellac_group_permissions[type]:
#             group.permissions.add(Permission.objects.get(codename=codename))
#         group.save()
#
#     return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
#
