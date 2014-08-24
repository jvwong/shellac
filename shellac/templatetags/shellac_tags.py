from django import template
from django.db.models import get_model

#@method: do_latest_content
#@parameters
#   - parser: template parser
#   - token: object representing part of template being parsed
#@return
#   - an instance of Django template Node
def do_latest_content(parser, token):
    bits = token.split_contents()
    # get_latest_content, app.model, n, as, varname
    if len(bits) != 5:
        raise template.TemplateSyntaxError("'get_latest_content' tag takes exactly four Arguments")

    model_args = bits[1].split(".")
    if len(model_args) != 2:
        raise template.TemplateSyntaxError("'get_latest_content' tag got invalid model: %s " % bits[1])

    model = get_model(*model_args)
    return LatestClipsNode(model, bits[2], bits[4])


#Class: LatestClipsNode - a subclass of django.template.Node
#@post condition - override method render()
class LatestClipsNode(template.Node):

    def __init__(self, model, n, varname):
        self.model = model
        self.n = int(n)
        self.varname = varname

    #method render
    #parameters
    #   - context: the dict of variables avaiable to template
    #return
    #   - string of output to template

    def render(self, context):
        context['latest_clips'] = self.model._default_manager.all()[:self.n]
        return ''


register = template.Library()
register.tag('get_latest_content', do_latest_content)