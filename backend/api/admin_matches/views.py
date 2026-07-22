"""Gestione partite (solo admin):
    getAdminMatches -> GET    /api/admin/matches?date=YYYY-MM-DD
    updateMatch     -> PATCH  /api/admin/matches/<id>
    deleteMatch     -> DELETE /api/admin/matches/<id>

A differenza di /api/all-matches (sola lettura, per tutti), qui ogni partita
include gli slug dei player nei team cosi il form di editing puo pre-popolarsi.
"""
from datetime import datetime

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.players.serializers import _MiniPlayer
from api.matches.models import Match
from api.matches.serializers import SubmitMatchSerializer
from api.matches.services import update_match, delete_match
from api.shared.permissions import IsAdmin


def _admin_row(m):
    """Match shape for the admin editor: full player objects + slug lists +
    the played-on date as YYYY-MM-DD so a <input type=date> can bind to it."""
    a = list(m.team_a.all())
    b = list(m.team_b.all())
    return {
        'id': m.id,
        'mode': m.mode,
        'scoreA': m.score_a,
        'scoreB': m.score_b,
        'playedAt': timezone.localtime(m.played_at).date().isoformat(),
        'teamA': _MiniPlayer(a, many=True).data,
        'teamB': _MiniPlayer(b, many=True).data,
        'teamAIds': [p.slug for p in a],
        'teamBIds': [p.slug for p in b],
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_matches(request):
    """Tutte le partite, o solo quelle di un giorno se ?date=YYYY-MM-DD."""
    qs = Match.objects.all().prefetch_related('team_a', 'team_b')
    date_str = request.query_params.get('date')
    if date_str:
        try:
            day = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Data non valida (usa YYYY-MM-DD).'},
                            status=status.HTTP_400_BAD_REQUEST)
        # Confronta sul giorno locale, cosi combacia con quanto mostrato/salvato.
        tz = timezone.get_current_timezone()
        qs = [m for m in qs if timezone.localtime(m.played_at, tz).date() == day]
    return Response([_admin_row(m) for m in qs])


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_match_detail(request, pk):
    match = Match.objects.filter(pk=pk).first()
    if not match:
        return Response({'detail': 'Partita non trovata.'},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        delete_match(match)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH: riusa la stessa validazione dell'inserimento (punteggi, team, mode).
    serializer = SubmitMatchSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    v = serializer.validated_data
    try:
        updated = update_match(
            match, v['mode'], v['teamA'], v['teamB'], v['scoreA'], v['scoreB'],
            played_date=v.get('playedAt'),
        )
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(_admin_row(updated))
