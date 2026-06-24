"""Chat endpoint: getChat -> GET /api/chat."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.chat.models import ChatMessage
from api.chat.serializers import ChatMessageSerializer


@api_view(['GET'])
def chat(request):
    return Response(ChatMessageSerializer(ChatMessage.objects.all(), many=True).data)
