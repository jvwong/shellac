from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

#make_paginator Returns {'page_obj':..., 'paginator': ...}
#object that can be passed directly to template
#@param queryset the query set to display
#@param page_by the number of objects per page to display
def make_paginator(queryset, request, page_by):
    paginator = Paginator(queryset, page_by)
    page = request.GET.get('page')

    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        page_obj = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999),
        # deliver last page of results.
        page_obj = paginator.page(paginator.num_pages)

    return {'page_obj': page_obj, 'paginator': paginator}

