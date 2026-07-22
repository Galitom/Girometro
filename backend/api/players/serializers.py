"""Player serializers shaped to match the objects mock.js returns.

Field names mirror the mock exactly (id, w, l, gf, ga, streak, best, delta, …)
so swapping mock.js for fetch() calls needs no shape changes on the frontend.
``_MiniPlayer`` is the embedded player record reused by other slices (matches,
stats, leagues, tournaments).
"""
from rest_framework import serializers

from api.players.models import Player


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
        fields = ['id', 'name', 'initials', 'color', 'elo', 'role',
                  'w', 'l', 'gf', 'ga', 'streak', 'best', 'delta']

    def get_delta(self, obj):
        # Weekly Elo delta, summed from history; falls back to 0.
        return getattr(obj, 'weekly_delta', 0)


class MeSerializer(PlayerSerializer):
    """Player plus the computed group rank, as getMe() returns."""
    rank = serializers.IntegerField()

    class Meta(PlayerSerializer.Meta):
        fields = PlayerSerializer.Meta.fields + ['rank']


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
