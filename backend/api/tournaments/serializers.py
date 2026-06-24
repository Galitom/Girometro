from rest_framework import serializers

from api.tournaments.models import Tournament


class TournamentListItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug')

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'status', 'players', 'cap', 'prize', 'fee', 'note']
