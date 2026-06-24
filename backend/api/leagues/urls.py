from django.urls import path

from . import views

urlpatterns = [
    path('leagues', views.leagues),
]
