from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import Group, Permission

from shellac.models import Category

### Category list
CATEGORIES = (
    'nascar',
    'tennis',
    'track & field',
    'golf',
    'boxing',
    'mixed martial arts',
    'wrestling',
    'horse racing',
    'ncaa football',
    'ncaa basketball',
    'nba',
    'nhl',
    'nfl',
    'mls',
    'mlb',
    'baseball',
    'rugby',
    'lacrosse',
    'cricket',
    'soccer',
    'champions league',
    'world cup soccer',
    'pop culture',
    'in the news',
    'business',
    'olympics'
)


def shellac_init_categories():
    for category in CATEGORIES:
        obj, created = Category.objects.get_or_create(title=category, description=category)


shellac_group_permissions = {
    "Contributor": [
        "add_clip",
        "change_clip",
        "delete_clip"
    ],
    "Listener": []
}

##Groups
def shellac_init_groups():

    #Loop over the types of groups
    for type in shellac_group_permissions:
        group, created = Group.objects.get_or_create(name=type)

        # only do if not in existence
        if not created:
            continue

        #Loop over the permissions codenames in each groups.
        # Assume these codenames and Permissions exist
        for codename in shellac_group_permissions[type]:
            try:
                permission = Permission.objects.get(codename=codename)
            except ObjectDoesNotExist:
                print("ObjectDoesNotExist")
            else:
                group.permissions.add(permission)
        group.save()

##Startup
def startup():
    shellac_init_groups()
    shellac_init_categories()