"""Model registry shim for the vertical-slice layout.

Each model now lives inside its feature slice (``api.players.models`` etc.).
Django still imports ``api.models`` at startup to register the app's models,
so this module re-exports them. Keeping the names importable from ``api.models``
also leaves the existing migrations, admin, and management commands untouched.
"""
from api.players.models import Player
from api.groups.models import Group
from api.matches.models import Match, EloHistory
from api.leagues.models import League, LeagueStanding
from api.tournaments.models import Tournament, BracketMatch
from api.chat.models import ChatMessage
from api.achievements.models import Achievement

__all__ = [
    'Player', 'Group', 'Match', 'EloHistory', 'League', 'LeagueStanding',
    'Tournament', 'BracketMatch', 'ChatMessage', 'Achievement',
]
