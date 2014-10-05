from django.views.generic.edit import UpdateView, DeleteView
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.views.generic.detail import DetailView
from shellac.views.util.permissions import IsAuthenticatedAndOwnerMixin


class UserDetailView(IsAuthenticatedAndOwnerMixin, DetailView):
    model = User
    template_name = 'shellac/user/user_detail.html'

    def get_context_data(self, *args, **kwargs):
        context = super(UserDetailView, self).get_context_data(*args, **kwargs)
        return context

class UserUpdate(IsAuthenticatedAndOwnerMixin, UpdateView):
    model = User
    fields = ['username', 'first_name', 'last_name', 'email']
    template_name = 'shellac/user/user_update.html'

    def get_success_url(self):
        pk = self.kwargs.get('pk')
        return reverse('user_detail', kwargs={'pk': pk})


# class UserDelete(DeleteView):
#     model = User
#     success_url = reverse_lazy('user-list')