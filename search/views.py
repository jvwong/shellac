from django.shortcuts import render
from django.db.models import Q
from shellac.models import Person
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def search(request):
    query = request.GET.get('search_term','')
    object_list = []
    if query:
        print("query: %s" % query)
        qobject = Person.objects.filter(
            Q(username__icontains=query) | Q(joined__icontains=query)
        )
        print(qobject)

    paginator = Paginator(qobject, 25) # Show 25 contacts per page
    page = request.GET.get('page')
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        page_obj = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        page_obj = paginator.page(paginator.num_pages)

    return render(request, 'shellac/app/people.html',
                  {'query': query, 'page_obj': page_obj, 'paginator': paginator})

