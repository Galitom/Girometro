"""Stats endpoints: getStats -> GET /api/stats, getPlayerStats -> GET /api/players/<slug>/stats."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.players.models import Player
from api.players.serializers import _MiniPlayer, PlayerSerializer
from api.players.services import player_rank, period_delta
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


def _stats_payload(player):
    """Shared getStats() payload for a player (used by /stats and /players/<slug>/stats)."""
    raw = build_stats(player)
    return {
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
        'records': _records(player),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    me_player = get_me(request)
    if not me_player:
        return Response({'detail': 'Nessun profilo per questo utente.'}, status=404)
    return Response(_stats_payload(me_player))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def player_stats(request, slug):
    """Full stats for any player, plus their ranking-card fields, for the profile modal."""
    try:
        player = Player.objects.get(slug=slug)
    except Player.DoesNotExist:
        return Response({'detail': 'Giocatore non trovato.'}, status=404)
    player.weekly_delta = period_delta(player, 'week')
    player.rank = player_rank(player)
    return Response({
        'player': {**PlayerSerializer(player).data, 'rank': player.rank},
        **_stats_payload(player),
    })
