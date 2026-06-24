"""Registration endpoint: register -> POST /api/auth/register (JWT via SimpleJWT)."""
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.accounts.serializers import RegisterSerializer, tokens_for


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        player = serializer.save()
    except IntegrityError:
        return Response({'detail': 'Registrazione non riuscita.'},
                        status=status.HTTP_400_BAD_REQUEST)
    # Mirror the login response so the frontend can store tokens immediately.
    return Response(
        {**tokens_for(player.user), 'player_id': player.slug},
        status=status.HTTP_201_CREATED,
    )
