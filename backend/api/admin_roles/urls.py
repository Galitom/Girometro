from django.urls import path

from . import views

urlpatterns = [
    path('admin/users', views.managed_users),
    path('admin/users/<slug:slug>/role', views.set_user_role),
    path('admin/users/<slug:slug>/password', views.set_user_password),
]
