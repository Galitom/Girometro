from django.urls import path

from . import views

urlpatterns = [
    path('admin/matches', views.admin_matches),
    path('admin/matches/<int:pk>', views.admin_match_detail),
]
