"""Wipe all app data so the app starts empty (users populate it by hand).

Run:  python manage.py reset_db
Deletes every Player, Match, league/tournament/chat/achievement row, and the
non-superuser accounts that own those players. Superusers are kept so you can
still reach /admin/.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    Group, Player, Match, EloHistory, League, LeagueStanding,
    Tournament, BracketMatch, Achievement,
)


class Command(BaseCommand):
    help = 'Delete all app data and non-superuser accounts (fresh empty start).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-users', action='store_true',
            help='Keep User accounts; only wipe Player/Match/etc. data.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        for model in (EloHistory, BracketMatch, LeagueStanding, Match,
                      Achievement, Tournament, League, Player, Group):
            model.objects.all().delete()

        if not options['keep_users']:
            deleted, _ = User.objects.filter(is_superuser=False).delete()
            self.stdout.write(f'Rimossi {deleted} account non-superuser.')

        self.stdout.write(self.style.SUCCESS('Database svuotato.'))
