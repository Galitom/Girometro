"""Serializers shaped to match the objects the frontend's mock.js returns.

Field names mirror the mock exactly (id, w, l, gf, ga, streak, best, delta, …)
so swapping mock.js for fetch() calls needs no shape changes on the frontend.
"""
from rest_framework import serializers

from .models import (
    Player, Match, League, Tournament, ChatMessage, Achievement,
)


class PlayerSerializer(serializers.ModelSerializer):
    """Matches the PLAYERS entries in mock.js."""
    id = serializers.CharField(source='slug')
    w = serializers.IntegerField(source='wins')
    l = serializers.IntegerField(source='losses')
    gf = serializers.IntegerField(source='goals_for')
    ga = serializers.IntegerField(source='goals_against')
    best = serializers.IntegerField(source='best_streak')
    delta = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['id', 'name', 'initials', 'color', 'elo',
                  'w', 'l', 'gf', 'ga', 'streak', 'best', 'delta']

    def get_delta(self, obj):
        # Weekly Elo delta, summed from history; falls back to 0.
        return getattr(obj, 'weekly_delta', 0)


class MeSerializer(PlayerSerializer):
    """Player plus the computed group rank, as getMe() returns."""
    rank = serializers.IntegerField()

    class Meta(PlayerSerializer.Meta):
        fields = PlayerSerializer.Meta.fields + ['rank']


class GroupSerializer(serializers.Serializer):
    name = serializers.CharField()
    members = serializers.IntegerField()
    tag = serializers.CharField()


class _MiniPlayer(serializers.ModelSerializer):
    """Embedded player object (mock embeds whole player records in matches)."""
    id = serializers.CharField(source='slug')
    w = serializers.IntegerField(source='wins')
    l = serializers.IntegerField(source='losses')
    gf = serializers.IntegerField(source='goals_for')
    ga = serializers.IntegerField(source='goals_against')
    best = serializers.IntegerField(source='best_streak')

    class Meta:
        model = Player
        fields = ['id', 'name', 'initials', 'color', 'elo',
                  'w', 'l', 'gf', 'ga', 'streak', 'best']


class MatchSerializer(serializers.Serializer):
    """Generic match shape — also reused by getLastMatch()."""
    mode = serializers.CharField()
    date = serializers.CharField()
    won = serializers.BooleanField()
    teamA = _MiniPlayer(many=True)
    teamB = _MiniPlayer(many=True)
    scoreA = serializers.IntegerField()
    scoreB = serializers.IntegerField()
    elo = serializers.IntegerField()


class SubmitMatchSerializer(serializers.Serializer):
    """Input for POST /api/matches — what RegistraModal sends."""
    mode = serializers.ChoiceField(choices=['1vs1', '2vs2'], default='1vs1')
    teamA = serializers.ListField(child=serializers.CharField(), min_length=1)
    teamB = serializers.ListField(child=serializers.CharField(), min_length=1)
    scoreA = serializers.IntegerField(min_value=0, max_value=99)
    scoreB = serializers.IntegerField(min_value=0, max_value=99)

    def validate(self, data):
        if data['scoreA'] == data['scoreB']:
            raise serializers.ValidationError('Una partita non può finire in parità.')
        overlap = set(data['teamA']) & set(data['teamB'])
        if overlap:
            raise serializers.ValidationError('Un giocatore non può stare in entrambe le squadre.')
        return data


class LeagueSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug')
    daysLeft = serializers.IntegerField(source='days_left')
    table = serializers.SerializerMethodField()

    class Meta:
        model = League
        fields = ['id', 'name', 'season', 'daysLeft', 'played', 'total', 'featured', 'table']

    def get_table(self, obj):
        return [
            {'p': _MiniPlayer(s.player).data, 'pts': s.points}
            for s in obj.standings.select_related('player').all()
        ]


class TournamentListItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug')

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'status', 'players', 'cap', 'prize', 'fee', 'note']


class AchievementSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug')
    desc = serializers.CharField(source='description')
    date = serializers.CharField(source='date_label')
    prog = serializers.IntegerField(source='progress')
    of = serializers.IntegerField(source='target')
    elo = serializers.BooleanField(source='is_elo')

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'desc', 'icon', 'got', 'date', 'prog', 'of', 'elo']

    def to_representation(self, obj):
        data = super().to_representation(obj)
        # Mock omits these keys when not applicable; mirror that.
        if not obj.got:
            data.pop('date', None)
        if obj.progress is None:
            data.pop('prog', None)
        if obj.target is None:
            data.pop('of', None)
        if not obj.is_elo:
            data.pop('elo', None)
        return data


class ChatMessageSerializer(serializers.ModelSerializer):
    who = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    t = serializers.CharField(source='time_label')
    mine = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'who', 'type', 'icon', 'text', 't', 'mine']

    def get_who(self, obj):
        return _MiniPlayer(obj.author).data if obj.author else None

    def get_type(self, obj):
        return 'event' if obj.is_event else None

    def get_mine(self, obj):
        return bool(obj.author and obj.author.is_me)

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if obj.is_event:
            data.pop('who', None)
            data.pop('mine', None)
        else:
            data.pop('type', None)
            data.pop('icon', None)
            if not data.get('mine'):
                data.pop('mine', None)
        return data
