"""Gestione ruoli (solo admin):
    getManagedUsers -> GET   /api/admin/users
    setUserRole     -> PATCH /api/admin/users/<slug>/role
    setUserPassword -> POST  /api/admin/users/<slug>/password
"""
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.players.models import Player
from api.shared.permissions import IsAdmin
from api.shared.request import get_me

VALID_ROLES = {c[0] for c in Player.ROLE_CHOICES}


def _user_row(p):
    return {
        'id': p.slug,
        'name': p.name,
        'initials': p.initials,
        'color': p.color,
        'role': p.role,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def managed_users(request):
    """Elenco di tutti gli utenti col ruolo, per il pannello di gestione."""
    rows = [_user_row(p) for p in Player.objects.all().order_by('name')]
    return Response(rows)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def set_user_role(request, slug):
    """Assegna un ruolo a un utente. Un admin non puo togliersi da solo il ruolo
    admin se resterebbe l'unico admin, per non chiudersi fuori dalla gestione."""
    role = request.data.get('role')
    if role not in VALID_ROLES:
        return Response({'detail': 'Ruolo non valido.'},
                        status=status.HTTP_400_BAD_REQUEST)

    target = Player.objects.filter(slug=slug).first()
    if not target:
        return Response({'detail': 'Utente non trovato.'},
                        status=status.HTTP_404_NOT_FOUND)

    me = get_me(request)
    demoting_self = (target.slug == me.slug and role != Player.ROLE_ADMIN)
    if demoting_self:
        other_admins = Player.objects.filter(
            role=Player.ROLE_ADMIN).exclude(slug=me.slug).exists()
        if not other_admins:
            return Response(
                {'detail': 'Sei l\'unico admin: assegna prima il ruolo admin a qualcun altro.'},
                status=status.HTTP_400_BAD_REQUEST)

    target.role = role
    target.save(update_fields=['role'])
    return Response(_user_row(target))


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def set_user_password(request, slug):
    """Reimposta la password dell'utente collegato al Player.

    Serve a chi ha dimenticato la password: lo comunica a un admin, che gliela
    reimposta da qui e gli passa quella nuova. La password viene validata con gli
    stessi AUTH_PASSWORD_VALIDATORS della registrazione."""
    password = request.data.get('password') or ''

    target = Player.objects.filter(slug=slug).first()
    if not target:
        return Response({'detail': 'Utente non trovato.'},
                        status=status.HTTP_404_NOT_FOUND)
    if not target.user_id:
        return Response({'detail': 'Questo profilo non ha un account collegato.'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = target.user
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        return Response({'detail': ' '.join(exc.messages)},
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.save(update_fields=['password'])
    return Response(_user_row(target))
