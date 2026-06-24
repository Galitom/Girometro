from django.db import models

from api.players.models import Player


class ChatMessage(models.Model):
    # Either a player message (author set) or a system 'event' (author null).
    author = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, related_name='messages')
    is_event = models.BooleanField(default=False)
    icon = models.CharField(max_length=30, blank=True)  # lucide icon name for events
    text = models.TextField()
    time_label = models.CharField(max_length=10, blank=True)  # e.g. '18:43'
    order = models.IntegerField(default=0)

    class Meta:
        app_label = 'api'
        ordering = ['order']
