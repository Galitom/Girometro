from django.urls import path

from . import views

urlpatterns = [
    path('last-match', views.last_match),
    path('activity', views.activity),
    path('all-matches', views.match_list),
    path('matches', views.matches),
]
