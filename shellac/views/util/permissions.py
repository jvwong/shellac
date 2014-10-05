from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponseForbidden
from django.http import HttpResponse
from django.template import loader, Context

class IsAuthenticatedAndOwnerMixin(object):
    @classmethod
    def as_view(cls, **initkwargs):
        view = super(IsAuthenticatedAndOwnerMixin, cls).as_view(**initkwargs)
        return login_required(view)

    def dispatch(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk == str(request.user.id):
            return super(IsAuthenticatedAndOwnerMixin, self).dispatch(request, *args, **kwargs)

        template = loader.get_template('403.html')
        context = Context({'resource': request.META['PATH_INFO'] })
        response = template.render(context)
        return HttpResponseForbidden(response)
