"""Player endpoints: getMe -> /api/me, getPlayers -> /api/players."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.players.models import Player
from api.players.serializers import PlayerSerializer, MeSerializer
from api.players.services import player_rank, period_delta
from api.shared.request import get_me

VALID_PERIODS = {'today', 'yesterday', 'week', 'month'}


def _annotate_delta(players, period='week', now=None):
    for p in players:
        p.weekly_delta = period_delta(p, period, now)
    return players


def _period(request):
    period = request.query_params.get('period', 'week')
    return period if period in VALID_PERIODS else 'week'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    player = get_me(request)
    if not player:
        return Response({'detail': 'Nessun profilo per questo utente.'}, status=404)
    _annotate_delta([player], _period(request))
    player.rank = player_rank(player)
    return Response(MeSerializer(player).data)


@api_view(['GET'])
def players(request):
    qs = list(Player.objects.all())  # already ordered by -elo
    _annotate_delta(qs, _period(request))
    return Response(PlayerSerializer(qs, many=True).data)
