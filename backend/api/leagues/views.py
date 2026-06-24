"""Leagues endpoint: getLeagues -> GET /api/leagues."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.leagues.models import League
from api.leagues.serializers import LeagueSerializer


@api_view(['GET'])
def leagues(request):
    qs = League.objects.prefetch_related('standings__player').all()
    return Response(LeagueSerializer(qs, many=True).data)
