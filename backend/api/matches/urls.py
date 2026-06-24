from django.urls import path

from . import views

urlpatterns = [
    path('last-match', views.last_match),
    path('activity', views.activity),
    path('matches', views.matches),
]
