from django.conf import settings
from django.db import models


class Player(models.Model):
    # Stable slug used as the public id by the frontend (e.g. 'teo').
    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    initials = models.CharField(max_length=4)
    color = models.CharField(max_length=9, default='#3f6f8f')

    elo = models.IntegerField(default=1500)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)       # +N win streak, -N loss streak
    best_streak = models.IntegerField(default=0)  # best win streak ever

    # The account that owns this player profile. A registered user gets exactly
    # one Player; "me" in the API is the Player of the authenticated user.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='player', null=True, blank=True,
    )

    class Meta:
        app_label = 'api'
        ordering = ['-elo']

    def __str__(self):
        return self.name
