"""Match serializers (output shape + the submit-match input)."""
from django.utils import timezone
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


# A match is won by the first side to reach this score.
WINNING_SCORE = 10

# Players per side, by mode.
TEAM_SIZE = {'1vs1': 1, '2vs2': 2}


class SubmitMatchSerializer(serializers.Serializer):
    """Input for POST /api/matches — what RegistraModal sends.

    A match is played to ``WINNING_SCORE`` (10): the winner has exactly 10, the
    loser anything from 0 to 9. The team size must match the chosen mode.
    """
    mode = serializers.ChoiceField(choices=['1vs1', '2vs2'], default='1vs1')
    teamA = serializers.ListField(child=serializers.CharField(), min_length=1)
    teamB = serializers.ListField(child=serializers.CharField(), min_length=1)
    scoreA = serializers.IntegerField(min_value=0, max_value=WINNING_SCORE)
    scoreB = serializers.IntegerField(min_value=0, max_value=WINNING_SCORE)
    # Optional: when the match was actually played. Lets users log old matches.
    # Defaults to "now" server-side when omitted.
    playedAt = serializers.DateField(required=False, allow_null=True)

    def validate_playedAt(self, value):
        if value and value > timezone.localdate():
            raise serializers.ValidationError('La data non può essere nel futuro.')
        return value

    def validate(self, data):
        if data['scoreA'] == data['scoreB']:
            raise serializers.ValidationError('Una partita non può finire in parità.')
        if max(data['scoreA'], data['scoreB']) != WINNING_SCORE:
            raise serializers.ValidationError(
                f'La squadra vincente deve arrivare a {WINNING_SCORE}.')
        size = TEAM_SIZE[data['mode']]
        if len(data['teamA']) != size or len(data['teamB']) != size:
            raise serializers.ValidationError(
                f'In modalità {data["mode"]} ogni squadra deve avere {size} giocator{"e" if size == 1 else "i"}.')
        overlap = set(data['teamA']) & set(data['teamB'])
        if overlap:
            raise serializers.ValidationError('Un giocatore non può stare in entrambe le squadre.')
        return data
