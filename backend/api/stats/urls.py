from django.urls import path

from . import views

urlpatterns = [
    path('stats', views.stats),
    path('players/<slug:slug>/stats', views.player_stats),
]
