from django.conf import settings
from django.db import models


class Group(models.Model):
    """The single foosball group the app revolves around (e.g. 'Polso Magico')."""
    name = models.CharField(max_length=80)
    tag = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return self.name

    @property
    def members(self):
        return Player.objects.count()


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
        ordering = ['-elo']

    def __str__(self):
        return self.name


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
        ordering = ['created_at']


class League(models.Model):
    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    season = models.CharField(max_length=80)
    days_left = models.IntegerField(default=0)
    played = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class LeagueStanding(models.Model):
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='standings')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    order = models.IntegerField(default=0)  # row order within the table

    class Meta:
        ordering = ['order']


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
        ordering = ['round', 'order']


class ChatMessage(models.Model):
    # Either a player message (author set) or a system 'event' (author null).
    author = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, related_name='messages')
    is_event = models.BooleanField(default=False)
    icon = models.CharField(max_length=30, blank=True)  # lucide icon name for events
    text = models.TextField()
    time_label = models.CharField(max_length=10, blank=True)  # e.g. '18:43'
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class Achievement(models.Model):
    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=160)
    icon = models.CharField(max_length=30)  # lucide icon name
    got = models.BooleanField(default=False)
    date_label = models.CharField(max_length=20, blank=True)  # when unlocked
    progress = models.IntegerField(null=True, blank=True)
    target = models.IntegerField(null=True, blank=True)
    is_elo = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name
