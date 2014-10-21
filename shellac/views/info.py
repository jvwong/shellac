from django.views.generic import TemplateView

#/about
class AboutView(TemplateView):
    template_name = "shellac/info/about.html"

class GettingStartedView(TemplateView):
    template_name = "shellac/info/started.html"

class PrivacyView(TemplateView):
    template_name = "shellac/info/privacy.html"
