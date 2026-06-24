from rest_framework import serializers

from api.players.serializers import _MiniPlayer
from api.chat.models import ChatMessage


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
