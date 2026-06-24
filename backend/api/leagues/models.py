from django.db import models

from api.players.models import Player


class League(models.Model):
    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    season = models.CharField(max_length=80)
    days_left = models.IntegerField(default=0)
    played = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.name


class LeagueStanding(models.Model):
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='standings')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    order = models.IntegerField(default=0)  # row order within the table

    class Meta:
        app_label = 'api'
        ordering = ['order']
