from django import template
register = template.Library()

#@method: add_class - adds class to the specified tag
#useage: In the template have tag {{ field | add_class:"arg"}}
#@parameters
#   - field: template parser
#   - arg: object representing part of template being parsed
#@return
#   - an instance of Django template Node
def add_class(field, css):
   return field.as_widget(attrs={"class": css})

register.filter('add_class', add_class)


#@method: add_attributes - adds the specified attribute
#useage: In the template have tag {{ field | add_attributes: css }} where css ="attr1:arg1,attr2:arg2"
#@parameters
#   - value: template parser
#   - arg: object representing part of template being parsed
#@return
#   - an instance of Django template Node
def add_attributes(field, css):
    attrs = {}
    definition = css.split(',')

    for d in definition:
        if ':' not in d:
            attrs['class'] = d
        else:
            t, v = d.split(':')
            attrs[t] = v

    return field.as_widget(attrs=attrs)

register.filter('add_attributes', add_attributes)

