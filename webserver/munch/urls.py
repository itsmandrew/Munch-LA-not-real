from django.urls import path
from .views import langchain_response, home

urlpatterns = [
    path('', home, name='home'),
    path('langchain-response/', langchain_response, name='langchain_response'),
]