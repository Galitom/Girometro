"""Tournaments endpoint: getTournaments -> GET /api/tournaments."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.players.serializers import _MiniPlayer
from api.tournaments.models import Tournament
from api.tournaments.serializers import TournamentListItemSerializer


@api_view(['GET'])
def tournaments(request):
    listing = TournamentListItemSerializer(Tournament.objects.all(), many=True).data
    featured = Tournament.objects.filter(featured=True).first() or Tournament.objects.first()
    bracket = {'quarti': [], 'semi': [], 'finale': []}
    if featured:
        for bm in featured.bracket.all():
            bracket[bm.round].append({
                'a': _MiniPlayer(bm.player_a).data if bm.player_a else None,
                'b': _MiniPlayer(bm.player_b).data if bm.player_b else None,
                'sa': bm.score_a,
                'sb': bm.score_b,
                'done': bm.done,
                **({'live': True} if bm.live else {}),
            })
    return Response({'list': listing, 'bracket': bracket})
