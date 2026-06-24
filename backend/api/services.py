"""Business logic that mutates state: recording a match and deriving stats."""
from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .elo import compute_delta
from .models import Player, Match, EloHistory


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


@transaction.atomic
def record_match(mode, team_a_slugs, team_b_slugs, score_a, score_b, perspective=None):
    """Create a Match, update every participant's Elo/W-L/goals/streak, and
    write EloHistory rows. Returns (match, elo_change) where elo_change is the
    signed delta from ``perspective``'s point of view when that player is in the
    match, else side A's.
    """
    team_a = list(Player.objects.select_for_update().filter(slug__in=team_a_slugs))
    team_b = list(Player.objects.select_for_update().filter(slug__in=team_b_slugs))
    if len(team_a) != len(team_a_slugs) or len(team_b) != len(team_b_slugs):
        raise ValueError('Uno o più giocatori non esistono.')

    a_won = score_a > score_b
    delta_a = compute_delta([p.elo for p in team_a], [p.elo for p in team_b], a_won)
    delta_b = -delta_a

    now = timezone.now()
    match = Match.objects.create(
        mode=mode, played_at=now,
        score_a=score_a, score_b=score_b,
        elo_change=abs(delta_a),
    )
    match.team_a.set(team_a)
    match.team_b.set(team_b)

    def apply(players, delta, scored, conceded, won):
        for p in players:
            p.elo += delta
            p.goals_for += scored
            p.goals_against += conceded
            if won:
                p.wins += 1
                p.streak = p.streak + 1 if p.streak > 0 else 1
                p.best_streak = max(p.best_streak, p.streak)
            else:
                p.losses += 1
                p.streak = p.streak - 1 if p.streak < 0 else -1
            p.save()
            EloHistory.objects.create(
                player=p, match=match, change=delta, elo_after=p.elo, created_at=now,
            )

    apply(team_a, delta_a, score_a, score_b, a_won)
    apply(team_b, delta_b, score_b, score_a, not a_won)

    # Report the change from the requesting player's side if involved, else A.
    if perspective and any(p.pk == perspective.pk for p in team_b):
        elo_change = delta_b
    else:
        elo_change = delta_a
    return match, elo_change


def build_stats(me):
    """Assemble the getStats() payload for a player from real data."""
    history = list(me.elo_history.order_by('created_at'))
    # eloSeries: ratings over time; seed with the earliest pre-change rating.
    if history:
        elo_series = [history[0].elo_after - history[0].change] + [h.elo_after for h in history]
    else:
        elo_series = [me.elo]

    # Rivalries (1vs1 opponents) and partners (2vs2 teammates).
    rivalries = {}
    partners = {}
    matches = (Match.objects
               .filter(Q(team_a=me) | Q(team_b=me))
               .prefetch_related('team_a', 'team_b')
               .distinct())
    for m in matches:
        a = list(m.team_a.all())
        b = list(m.team_b.all())
        mine, theirs = (a, b) if me in a else (b, a)
        my_score, opp_score = (m.score_a, m.score_b) if me in a else (m.score_b, m.score_a)
        won = my_score > opp_score

        for mate in mine:
            if mate == me:
                continue
            rec = partners.setdefault(mate.slug, {'mate': mate, 'w': 0, 'l': 0})
            rec['w' if won else 'l'] += 1

        for opp in theirs:
            rec = rivalries.setdefault(opp.slug, {'opp': opp, 'w': 0, 'l': 0, 'gf': 0, 'ga': 0})
            rec['w' if won else 'l'] += 1
            rec['gf'] += my_score
            rec['ga'] += opp_score

    return {
        'elo_series': elo_series,
        'rivalries': sorted(rivalries.values(), key=lambda r: r['w'] + r['l'], reverse=True),
        'partners': sorted(partners.values(), key=lambda r: r['w'] + r['l'], reverse=True),
        'me': me,
    }
