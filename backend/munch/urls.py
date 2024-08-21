# pylint: disable=E0401
# pylint: disable=W0718
# pylint: disable=C0114

from django.urls import path
from .api import api

urlpatterns = [
    path("api/", api.urls),
]
