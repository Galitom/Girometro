"""Player-centric reads: group rank and the weekly Elo delta."""
from datetime import timedelta

from django.utils import timezone

from api.players.models import Player


def player_rank(player):
    """1-based position of a player in the group by Elo (ties broken by Elo desc)."""
    higher = Player.objects.filter(elo__gt=player.elo).count()
    return higher + 1


def weekly_delta(player, now=None):
    """Sum of Elo changes for a player over the last 7 days."""
    now = now or timezone.now()
    since = now - timedelta(days=7)
    rows = player.elo_history.filter(created_at__gte=since)
    return sum(r.change for r in rows)
