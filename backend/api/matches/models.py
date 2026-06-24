from django.db import models

from api.players.models import Player


class Match(models.Model):
    MODE_CHOICES = [('1vs1', '1vs1'), ('2vs2', '2vs2')]

    mode = models.CharField(max_length=8, choices=MODE_CHOICES, default='1vs1')
    played_at = models.DateTimeField()
    team_a = models.ManyToManyField(Player, related_name='matches_as_a')
    team_b = models.ManyToManyField(Player, related_name='matches_as_b')
    score_a = models.IntegerField()
    score_b = models.IntegerField()
    # Elo delta awarded to the winning side (positive), for display.
    elo_change = models.IntegerField(default=0)

    class Meta:
        app_label = 'api'
        ordering = ['-played_at']

    def __str__(self):
        return f'{self.mode} {self.score_a}-{self.score_b} @ {self.played_at:%Y-%m-%d %H:%M}'

    @property
    def team_a_won(self):
        return self.score_a > self.score_b


class EloHistory(models.Model):
    """One row per player per match: signed Elo change and the resulting rating.

    Drives the Elo line chart (eloSeries) and the weekly delta.
    """
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='elo_history')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='elo_history', null=True, blank=True)
    change = models.IntegerField()
    elo_after = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        app_label = 'api'
        ordering = ['created_at']
