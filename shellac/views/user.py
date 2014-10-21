from django.views.generic.edit import UpdateView, DeleteView
from django.core.urlresolvers import reverse, reverse_lazy
from django.contrib.auth.models import User
from django.views.generic.detail import DetailView
from shellac.views.util.permissions import User_IsAuthenticatedAndOwnerMixin


class UserDetailView(User_IsAuthenticatedAndOwnerMixin, DetailView):
    model = User
    template_name = 'shellac/user/user_detail.html'

    def get_context_data(self, *args, **kwargs):
        context = super(UserDetailView, self).get_context_data(*args, **kwargs)
        return context

class UserUpdate(User_IsAuthenticatedAndOwnerMixin, UpdateView):
    model = User
    fields = ['username', 'first_name', 'last_name', 'email']
    template_name = 'shellac/user/user_update.html'

    def get_success_url(self):
        pk = self.kwargs.get('pk')
        return reverse('user_detail', kwargs={'pk': pk})


class UserDelete(User_IsAuthenticatedAndOwnerMixin, DeleteView):
    model = User
    template_name = 'shellac/user/user_check_delete.html'
    success_url = reverse_lazy('shellac_accounts_signup')

### Permit User to change password
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import HttpResponseRedirect

@login_required(login_url='/accounts/signin/')
def user_password_change(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, data=request.POST)

        if form.is_valid():
            password = form.clean_new_password2()
            form.save()
            return HttpResponseRedirect("/user/" + str(request.user.id) + "/")
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'shellac/user/user_password_change.html', {'form': form})
