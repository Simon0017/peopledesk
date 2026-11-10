from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Page-number pagination where the client can choose the page size.

    Response envelope: {"count": int, "next": url|null, "previous": url|null, "results": [...]}
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
