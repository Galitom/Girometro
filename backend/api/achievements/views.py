"""Achievements endpoint: getAchievements -> GET /api/achievements."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.achievements.models import Achievement
from api.achievements.serializers import AchievementSerializer


@api_view(['GET'])
def achievements(request):
    return Response(AchievementSerializer(Achievement.objects.all(), many=True).data)
