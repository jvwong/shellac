from django.contrib.auth.decorators import login_required, permission_required
from django.utils.decorators import method_decorator
from django.http.response import HttpResponseForbidden
from django.template import loader, Context
from django.shortcuts import get_object_or_404

from shellac.models import Clip


class User_IsAuthenticatedAndOwnerMixin(object):
    @classmethod
    def as_view(cls, **initkwargs):
        view = super(User_IsAuthenticatedAndOwnerMixin, cls).as_view(**initkwargs)
        return login_required(view)

    def dispatch(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if pk == str(request.user.id):
            return super(User_IsAuthenticatedAndOwnerMixin, self).dispatch(request, *args, **kwargs)

        template = loader.get_template('403.html')
        context = Context({'resource': request.META['PATH_INFO'] })
        response = template.render(context)
        return HttpResponseForbidden(response)


class Clip_IsAuthenticatedAndOwnerMixin(object):
    @classmethod
    def as_view(cls, **initkwargs):
        view = super(Clip_IsAuthenticatedAndOwnerMixin, cls).as_view(**initkwargs)
        return login_required(view)

    @method_decorator(permission_required(['shellac.add_clip',
                                           'shellac.change_clip',
                                           'shellac.delete_clip',
                                           ], raise_exception=True))
    def dispatch(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        clip = get_object_or_404(Clip, pk=int(pk))
        if clip.author == request.user.person:
            return super(Clip_IsAuthenticatedAndOwnerMixin, self).dispatch(request, *args, **kwargs)

        template = loader.get_template('403.html')
        context = Context({'resource': request.META['PATH_INFO']})
        response = template.render(context)
        return HttpResponseForbidden(response)