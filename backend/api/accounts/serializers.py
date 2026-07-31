"""Registration serializer and helpers (JWT via SimpleJWT)."""
import re

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from api.players.models import Player


def _unique_slug(base):
    """Turn a display name into a slug unique among Players."""
    base = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-') or 'player'
    slug = base
    i = 2
    while Player.objects.filter(slug=slug).exists():
        slug = f'{base}-{i}'
        i += 1
    return slug


def _initials(name):
    parts = [p for p in name.split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return (name[:2] or 'PL').upper()


# A bright neon "arcade" palette — each new player gets a distinct, luminous
# avatar tile (dark initials read well on these). Order matches the mockup.
_PALETTE = [
    '#3edcf0', '#ff4dd8', '#f2d648', '#5ee89c', '#7c6cff',
    '#ff8a3d', '#4dd8a8', '#ff6ec7', '#9be34d', '#4db8ff',
]


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=6, write_only=True)
    name = serializers.CharField(max_length=80, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username già in uso.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data['username']
        name = (validated_data.get('name') or '').strip() or username
        user = User.objects.create_user(
            username=username, password=validated_data['password'],
        )
        # Il primo utente registrato su un DB vuoto diventa admin, cosi c'e
        # sempre qualcuno che puo gestire i ruoli. Gli altri partono da 'player'.
        is_first = not Player.objects.exists()
        color = _PALETTE[Player.objects.count() % len(_PALETTE)]
        player = Player.objects.create(
            user=user,
            slug=_unique_slug(name),
            name=name,
            initials=_initials(name),
            color=color,
            role=Player.ROLE_ADMIN if is_first else Player.ROLE_PLAYER,
        )
        return player


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}
