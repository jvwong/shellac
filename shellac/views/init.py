from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect

from shellac.models import Category

### Category list
@login_required(login_url='/accounts/signin/')
def shellac_init_category(request, *args, **kwargs):
    if request.user.is_staff:
        if not Category.objects.all().count():
            Category.objects.autopopulate()
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))

