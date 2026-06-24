"""Aggregates the per-slice url modules under /api/.

Each feature slice owns its own urls.py; this root just mounts them. The full
endpoint table lives in backend/README.md.
"""
from django.urls import include, path

urlpatterns = [
    path('', include('api.accounts.urls')),
    path('', include('api.players.urls')),
    path('', include('api.matches.urls')),
    path('', include('api.stats.urls')),
    path('', include('api.groups.urls')),
    path('', include('api.leagues.urls')),
    path('', include('api.tournaments.urls')),
    path('', include('api.chat.urls')),
    path('', include('api.achievements.urls')),
]
