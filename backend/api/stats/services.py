"""Derive the getStats() payload for a player from real match/Elo data."""
from django.db.models import Q

from api.matches.models import Match


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
