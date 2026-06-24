"""Rebuild every player's Elo/W-L/goals/streak and EloHistory from scratch by
replaying all matches in chronological order.

Run after editing or deleting matches via /admin/ so ratings stay consistent.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from api.matches.services import recompute_all
from api.players.models import Player


class Command(BaseCommand):
    help = 'Recompute all Elo ratings by replaying matches in date order.'

    @transaction.atomic
    def handle(self, *args, **options):
        recompute_all()
        n = Player.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Elo ricalcolato per {n} giocatori.'))
