from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path('auth/register', views.register),
    path('auth/login', TokenObtainPairView.as_view()),     # {username, password} -> {access, refresh}
    path('auth/refresh', TokenRefreshView.as_view()),       # {refresh} -> {access}
]
