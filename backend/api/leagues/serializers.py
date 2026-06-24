from rest_framework import serializers

from api.players.serializers import _MiniPlayer
from api.leagues.models import League


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
