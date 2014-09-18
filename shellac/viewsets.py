from rest_framework import mixins, viewsets


class ListViewSet(mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  viewsets.GenericViewSet):
    pass


class DetailViewSet(mixins.RetrieveModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
    pass


class ReadOnlyDetailViewSet(mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    pass

