from django.contrib.sitemaps import Sitemap
from shellac.models import Snippet
import datetime

from django.core.urlresolvers import reverse

class SnippetSitemap(Sitemap):
    changefreq = "never"
    priority = 0.5

    def items(self):
        return Snippet.objects.all()

    def lastmod(self, obj):
        return obj.updated_date

class PageSitemap(Sitemap):
    changefreq = "never"
    priority = 0.5
    lastmod = datetime.datetime.now()

    def __init__(self, names):
        self.names = names

    def items(self):
        return self.names

    def location(self, item):
        return reverse(item)
