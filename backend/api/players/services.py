"""Player-centric reads: group rank and the weekly Elo delta."""
from datetime import timedelta

from django.utils import timezone

from api.players.models import Player


def player_rank(player):
    """1-based position of a player in the group by Elo (ties broken by Elo desc)."""
    higher = Player.objects.filter(elo__gt=player.elo).count()
    return higher + 1


def period_bounds(period='week', now=None):
    """Local-time [since, until) window for a calendar period.

    period: 'today' | 'yesterday' | 'week' | 'month'. ``until`` is None for
    open-ended windows (everything up to now); only 'yesterday' has an upper bound.
    """
    now = timezone.localtime(now or timezone.now())
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == 'today':
        return midnight, None
    if period == 'yesterday':
        return midnight - timedelta(days=1), midnight
    if period == 'month':
        return midnight.replace(day=1), None
    # default: 'week' -> Monday 00:00 of the current calendar week
    return midnight - timedelta(days=now.weekday()), None


def period_delta(player, period='week', now=None):
    """Sum of Elo changes for a player within a calendar period."""
    since, until = period_bounds(period, now)
    rows = player.elo_history.filter(created_at__gte=since)
    if until is not None:
        rows = rows.filter(created_at__lt=until)
    return sum(r.change for r in rows)


# Back-compat alias: the weekly delta is just the 'week' period.
def weekly_delta(player, now=None):
    return period_delta(player, 'week', now)
