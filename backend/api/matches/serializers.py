"""Match serializers (output shape + the submit-match input)."""
from rest_framework import serializers

from api.players.serializers import _MiniPlayer


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
