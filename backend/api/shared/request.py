"""Request-scoped helpers shared across slices."""
from api.players.models import Player


def get_me(request):
    """The Player owned by the authenticated user, or None if anonymous."""
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        return Player.objects.filter(user=user).first()
    return None
