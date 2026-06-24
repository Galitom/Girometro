"""API endpoints, one per mock.js function.

Mapping (mock.js -> endpoint):
    getMe          -> GET  /api/me
    getGroup       -> GET  /api/group
    getPlayers     -> GET  /api/players
    getLastMatch   -> GET  /api/last-match
    getActivity    -> GET  /api/activity
    getStats       -> GET  /api/stats
    getLeagues     -> GET  /api/leagues
    getTournaments -> GET  /api/tournaments
    getChat        -> GET  /api/chat
    getAchievements-> GET  /api/achievements
    submitMatch    -> POST /api/matches
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Player, Group, Match, League, Tournament, BracketMatch,
    ChatMessage, Achievement,
)
from .serializers import (
    PlayerSerializer, MeSerializer, GroupSerializer, MatchSerializer,
    SubmitMatchSerializer, LeagueSerializer, TournamentListItemSerializer,
    AchievementSerializer, ChatMessageSerializer, _MiniPlayer,
)
from .services import player_rank, weekly_delta, record_match, build_stats


def _get_me(request):
    """The Player owned by the authenticated user, or None if anonymous."""
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        return Player.objects.filter(user=user).first()
    return None


def _annotate_delta(players, now=None):
    for p in players:
        p.weekly_delta = weekly_delta(p, now)
    return players


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    player = _get_me(request)
    if not player:
        return Response({'detail': 'Nessun profilo per questo utente.'}, status=404)
    _annotate_delta([player])
    player.rank = player_rank(player)
    return Response(MeSerializer(player).data)


@api_view(['GET'])
def group(request):
    g = Group.objects.first()
    if not g:
        return Response({'detail': 'Nessun gruppo configurato.'}, status=404)
    return Response(GroupSerializer({'name': g.name, 'members': g.members, 'tag': g.tag}).data)


@api_view(['GET'])
def players(request):
    qs = list(Player.objects.all())  # already ordered by -elo
    _annotate_delta(qs)
    return Response(PlayerSerializer(qs, many=True).data)


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


def _humanize(dt):
    from django.utils import timezone
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


@api_view(['GET'])
def last_match(request):
    me_player = _get_me(request)
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
    me_player = _get_me(request)
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    me_player = _get_me(request)
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
def leagues(request):
    qs = League.objects.prefetch_related('standings__player').all()
    return Response(LeagueSerializer(qs, many=True).data)


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


@api_view(['GET'])
def chat(request):
    return Response(ChatMessageSerializer(ChatMessage.objects.all(), many=True).data)


@api_view(['GET'])
def achievements(request):
    return Response(AchievementSerializer(Achievement.objects.all(), many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def matches(request):
    serializer = SubmitMatchSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    v = serializer.validated_data
    me_player = _get_me(request)
    try:
        match, elo_change = record_match(
            v['mode'], v['teamA'], v['teamB'], v['scoreA'], v['scoreB'],
            perspective=me_player,
        )
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # Mirrors submitMatch()'s return: { ok, eloChange }.
    return Response({'ok': True, 'eloChange': elo_change}, status=status.HTTP_201_CREATED)
