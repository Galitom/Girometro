"""Match endpoints:
    getLastMatch -> GET  /api/last-match
    getActivity  -> GET  /api/activity
    submitMatch  -> POST /api/matches
"""
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.players.serializers import _MiniPlayer
from api.matches.models import Match
from api.matches.serializers import SubmitMatchSerializer
from api.matches.services import record_match
from api.shared.request import get_me


def _humanize(dt):
    now = timezone.now()
    diff = now - dt
    secs = diff.total_seconds()
    if secs < 3600:
        return f'{max(1, int(secs // 60))} min fa'
    if secs < 86400:
        return f'{int(secs // 3600)} ore fa'
    if secs < 172800:
        return f'Ieri, {timezone.localtime(dt):%H:%M}'
    return f'{timezone.localtime(dt):%d/%m, %H:%M}'


def _format_match(m, perspective):
    """Shape a Match into the mock match object from a player's perspective."""
    a = list(m.team_a.all())
    b = list(m.team_b.all())
    me_in_a = perspective in a if perspective else True
    team_a, team_b = (a, b) if me_in_a else (b, a)
    score_a, score_b = (m.score_a, m.score_b) if me_in_a else (m.score_b, m.score_a)
    won = score_a > score_b
    elo = m.elo_change if won else -m.elo_change
    return {
        'mode': m.mode,
        'date': _humanize(m.played_at),
        'won': won,
        'teamA': _MiniPlayer(team_a, many=True).data,
        'teamB': _MiniPlayer(team_b, many=True).data,
        'scoreA': score_a,
        'scoreB': score_b,
        'elo': elo,
    }


@api_view(['GET'])
def last_match(request):
    me_player = get_me(request)
    m = None
    if me_player:
        m = Match.objects.filter(team_a=me_player).first() or \
            Match.objects.filter(team_b=me_player).first()
    if not m:
        m = Match.objects.first()
    if not m:
        return Response(None)
    return Response(_format_match(m, me_player))


@api_view(['GET'])
def activity(request):
    me_player = get_me(request)
    out = []
    for m in Match.objects.all()[:8]:
        a = list(m.team_a.all())
        b = list(m.team_b.all())
        if not a or not b:
            continue
        out.append({
            'id': m.id,
            'a': _MiniPlayer(a[0]).data,
            'b': _MiniPlayer(b[0]).data,
            'sa': m.score_a,
            'sb': m.score_b,
            'when': _humanize(m.played_at),
            'mode': m.mode,
            'mine': bool(me_player and (me_player in a or me_player in b)),
        })
    return Response(out)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def matches(request):
    serializer = SubmitMatchSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    v = serializer.validated_data
    me_player = get_me(request)
    try:
        match, elo_change = record_match(
            v['mode'], v['teamA'], v['teamB'], v['scoreA'], v['scoreB'],
            perspective=me_player, played_date=v.get('playedAt'),
        )
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # Mirrors submitMatch()'s return: { ok, eloChange }.
    return Response({'ok': True, 'eloChange': elo_change}, status=status.HTTP_201_CREATED)
