from django.shortcuts import render_to_response
from jraywo.models import Entry
from django.db.models import Q

def search(request):
    query = request.GET.get('search_term','')
    object_list = []
    if query:
        object_list = Entry.live.filter(
            Q(body__icontains=query) | Q(title__icontains=query) 
            )
                
    return render_to_response('search/search.html',
                              {'query' : query,
                              'object_list': object_list}
                              )
