"""Player endpoints: getMe -> /api/me, getPlayers -> /api/players."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.players.models import Player
from api.players.serializers import PlayerSerializer, MeSerializer
from api.players.services import player_rank, weekly_delta
from api.shared.request import get_me


def _annotate_delta(players, now=None):
    for p in players:
        p.weekly_delta = weekly_delta(p, now)
    return players


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    player = get_me(request)
    if not player:
        return Response({'detail': 'Nessun profilo per questo utente.'}, status=404)
    _annotate_delta([player])
    player.rank = player_rank(player)
    return Response(MeSerializer(player).data)


@api_view(['GET'])
def players(request):
    qs = list(Player.objects.all())  # already ordered by -elo
    _annotate_delta(qs)
    return Response(PlayerSerializer(qs, many=True).data)
