from rest_framework import serializers

from api.achievements.models import Achievement


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
