"""Business logic that records a match and updates every participant."""
from datetime import datetime, time

from django.db import transaction
from django.utils import timezone

from api.shared.elo import compute_delta
from api.players.models import Player
from api.matches.models import Match, EloHistory

# Every player starts here; the model default mirrors this.
STARTING_ELO = 1500


def _resolve_played_at(played_date):
    """Turn an optional played-on date into an aware datetime.

    Today (or no date) -> now, so the latest match sorts to the top. A past
    date -> noon local time, far enough from midnight that converting to UTC
    can't slip it into the wrong day.
    """
    now = timezone.now()
    if played_date is None or played_date >= timezone.localdate():
        return now
    naive = datetime.combine(played_date, time(12, 0))
    return timezone.make_aware(naive, timezone.get_current_timezone())


def recompute_all(match_of_interest=None, perspective=None):
    """Replay every match in chronological order, rebuilding each player's Elo,
    W/L, goals, streaks and EloHistory from scratch.

    Elo is relative and order-dependent, so inserting a backdated match shifts
    the ratings of every match that follows it. Replaying the whole history is
    the only way to keep ratings consistent. For a casual group this is a few
    hundred rows — cheap enough to run on every insert.

    Returns the signed Elo delta of ``match_of_interest`` from ``perspective``'s
    side (or side A's), or 0 when that match isn't given.
    """
    players = {p.slug: p for p in Player.objects.select_for_update().all()}
    # Reset every player to their starting state.
    for p in players.values():
        p.elo = STARTING_ELO
        p.wins = p.losses = 0
        p.goals_for = p.goals_against = 0
        p.streak = p.best_streak = 0

    EloHistory.objects.all().delete()

    # Oldest first; id breaks ties for matches sharing a timestamp.
    matches = (Match.objects.order_by('played_at', 'id')
               .prefetch_related('team_a', 'team_b'))

    history_rows = []
    result_delta = 0

    for m in matches:
        team_a = [players[p.slug] for p in m.team_a.all()]
        team_b = [players[p.slug] for p in m.team_b.all()]
        if not team_a or not team_b:
            continue  # malformed match, skip defensively

        a_won = m.score_a > m.score_b
        delta_a = compute_delta([p.elo for p in team_a], [p.elo for p in team_b], m.score_a, m.score_b)
        delta_b = -delta_a

        # Keep the stored display delta in sync with the recomputed value.
        if m.elo_change != abs(delta_a):
            m.elo_change = abs(delta_a)
            m.save(update_fields=['elo_change'])

        def apply(members, delta, scored, conceded, won):
            for p in members:
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
                history_rows.append(EloHistory(
                    player=p, match=m, change=delta, elo_after=p.elo,
                    created_at=m.played_at,
                ))

        apply(team_a, delta_a, m.score_a, m.score_b, a_won)
        apply(team_b, delta_b, m.score_b, m.score_a, not a_won)

        if match_of_interest is not None and m.pk == match_of_interest.pk:
            in_b = any(p.pk == perspective.pk for p in team_b) if perspective else False
            result_delta = delta_b if in_b else delta_a

    EloHistory.objects.bulk_create(history_rows)
    for p in players.values():
        p.save()

    return result_delta


@transaction.atomic
def record_match(mode, team_a_slugs, team_b_slugs, score_a, score_b,
                 perspective=None, played_date=None):
    """Create a Match, then recompute every player's Elo chronologically so the
    new match affects ratings in date order. Returns (match, elo_change) where
    elo_change is the signed delta of the new match from ``perspective``'s side
    (or side A's). ``played_date`` (optional) backdates the match.
    """
    team_a = list(Player.objects.filter(slug__in=team_a_slugs))
    team_b = list(Player.objects.filter(slug__in=team_b_slugs))
    if len(team_a) != len(team_a_slugs) or len(team_b) != len(team_b_slugs):
        raise ValueError('Uno o più giocatori non esistono.')

    match = Match.objects.create(
        mode=mode, played_at=_resolve_played_at(played_date),
        score_a=score_a, score_b=score_b,
        elo_change=0,  # filled in by the recompute below
    )
    match.team_a.set(team_a)
    match.team_b.set(team_b)

    elo_change = recompute_all(match_of_interest=match, perspective=perspective)
    return match, elo_change
