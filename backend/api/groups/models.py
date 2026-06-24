from django.db import models

from api.players.models import Player


class Group(models.Model):
    """The single foosball group the app revolves around (e.g. 'Polso Magico')."""
    name = models.CharField(max_length=80)
    tag = models.CharField(max_length=120, blank=True)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.name

    @property
    def members(self):
        return Player.objects.count()
