"""Stats endpoint: getStats -> GET /api/stats."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.players.serializers import _MiniPlayer
from api.stats.services import build_stats
from api.shared.request import get_me


def _synergy(w, l):
    total = w + l
    return round(w / total * 100) if total else 0


def _records(me_player):
    """Highlight records derived from real data, mirroring the mock's labels."""
    peak = me_player.elo_history.order_by('-elo_after').first()
    peak_elo = peak.elo_after if peak else me_player.elo
    return [
        {'label': 'Vittorie totali',   'value': str(me_player.wins),       'sub': 'in carriera'},
        {'label': 'Striscia più lunga', 'value': str(me_player.best_streak), 'sub': 'vittorie consecutive'},
        {'label': 'Elo massimo',        'value': str(peak_elo),             'sub': 'picco stagionale'},
        {'label': 'Gol fatti',          'value': str(me_player.goals_for),  'sub': 'in carriera'},
    ]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    me_player = get_me(request)
    if not me_player:
        return Response({'detail': 'Nessun profilo per questo utente.'}, status=404)
    raw = build_stats(me_player)
    return Response({
        'eloSeries': raw['elo_series'],
        'rivalries': [
            {'opp': _MiniPlayer(r['opp']).data, 'w': r['w'], 'l': r['l'], 'gf': r['gf'], 'ga': r['ga']}
            for r in raw['rivalries']
        ],
        'partners': [
            {'mate': _MiniPlayer(r['mate']).data, 'w': r['w'], 'l': r['l'],
             'syn': _synergy(r['w'], r['l'])}
            for r in raw['partners']
        ],
        'records': _records(me_player),
    })
