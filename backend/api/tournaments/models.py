from django.db import models

from api.players.models import Player


class Tournament(models.Model):
    STATUS_CHOICES = [('live', 'live'), ('open', 'open'), ('done', 'done')]

    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='open')
    players = models.IntegerField(default=0)
    cap = models.IntegerField(null=True, blank=True)
    prize = models.CharField(max_length=20, blank=True)
    fee = models.CharField(max_length=20, blank=True)
    note = models.CharField(max_length=120, blank=True)
    # Only one tournament is shown as the active bracket on the page.
    featured = models.BooleanField(default=False)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.name


class BracketMatch(models.Model):
    ROUND_CHOICES = [('quarti', 'quarti'), ('semi', 'semi'), ('finale', 'finale')]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='bracket')
    round = models.CharField(max_length=10, choices=ROUND_CHOICES)
    order = models.IntegerField(default=0)
    player_a = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    player_b = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    score_a = models.IntegerField(null=True, blank=True)
    score_b = models.IntegerField(null=True, blank=True)
    done = models.BooleanField(default=False)
    live = models.BooleanField(default=False)

    class Meta:
        app_label = 'api'
        ordering = ['round', 'order']
