from django.contrib import admin

from .models import (
    Group, Player, Match, EloHistory, League, LeagueStanding,
    Tournament, BracketMatch, Achievement,
)


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'elo', 'wins', 'losses', 'streak', 'user')
    search_fields = ('name', 'slug')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'mode', 'score_a', 'score_b', 'played_at', 'elo_change')


class LeagueStandingInline(admin.TabularInline):
    model = LeagueStanding
    extra = 0


@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'season', 'featured')
    inlines = [LeagueStandingInline]


class BracketMatchInline(admin.TabularInline):
    model = BracketMatch
    extra = 0


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'featured')
    inlines = [BracketMatchInline]


admin.site.register(Group)
admin.site.register(EloHistory)
admin.site.register(Achievement)
