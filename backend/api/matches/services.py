"""Business logic that records a match and updates every participant."""
from django.db import transaction
from django.utils import timezone

from api.shared.elo import compute_delta
from api.players.models import Player
from api.matches.models import Match, EloHistory


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
