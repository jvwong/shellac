from django import template
register = template.Library()

#@method: add_class - adds class to the specified tag
#useage: In the template have tag {{ field | add_class:"arg"}}
#@param field template parser
#@param arg object representing part of template being parsed
#@return instance of Django template Node
def add_class(field, css):
   return field.as_widget(attrs={"class": css})

register.filter('add_class', add_class)


#@method: add_attributes - adds the specified attribute
#useage: In the template have tag {{ field | add_attributes: css }} where css ="attr1:arg1,attr2:arg2"
#@param value template parser
#@param arg object representing part of template being parsed
#@return an instance of Django template Node
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


import datetime
def dayssince(value):
    "Returns number of days between today and value."
    today = datetime.date.today()
    diff  = today - value
    if diff.days > 1:
        return '%s days ago' % diff.days
    elif diff.days == 1:
        return 'yesterday'
    elif diff.days == 0:
        return 'today'
    else:
        # Date is in the future; return formatted date.
        return value.strftime("%B %d, %Y")

register.filter('dayssince', dayssince)
