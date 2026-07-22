"""Permessi basati sul ruolo del Player, condivisi tra le slice.

Il ruolo vive sul Player collegato all'utente autenticato (vedi
``players.models.Player``). Questi permessi DRF leggono quel ruolo tramite
``get_me`` e vanno combinati con ``IsAuthenticated`` nelle view.
"""
from rest_framework.permissions import BasePermission

from api.shared.request import get_me


class CanManageMatches(BasePermission):
    """Consente la scrittura solo a chi puo gestire le partite (admin/backoffice)."""
    message = 'Non hai i permessi per gestire le partite.'

    def has_permission(self, request, view):
        me = get_me(request)
        return bool(me and me.can_manage_matches)


class IsAdmin(BasePermission):
    """Consente l'accesso solo agli utenti con ruolo admin."""
    message = 'Solo un amministratore puo eseguire questa operazione.'

    def has_permission(self, request, view):
        me = get_me(request)
        return bool(me and me.is_admin)
