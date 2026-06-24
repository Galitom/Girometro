from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views
from .auth import register

urlpatterns = [
    # Auth
    path('auth/register', register),
    path('auth/login', TokenObtainPairView.as_view()),     # {username, password} -> {access, refresh}
    path('auth/refresh', TokenRefreshView.as_view()),       # {refresh} -> {access}

    path('me', views.me),
    path('group', views.group),
    path('players', views.players),
    path('last-match', views.last_match),
    path('activity', views.activity),
    path('stats', views.stats),
    path('leagues', views.leagues),
    path('tournaments', views.tournaments),
    path('chat', views.chat),
    path('achievements', views.achievements),
    path('matches', views.matches),
]
