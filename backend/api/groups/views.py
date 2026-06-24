"""Group endpoint: getGroup -> GET /api/group."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.groups.models import Group
from api.groups.serializers import GroupSerializer


@api_view(['GET'])
def group(request):
    g = Group.objects.first()
    if not g:
        return Response({'detail': 'Nessun gruppo configurato.'}, status=404)
    return Response(GroupSerializer({'name': g.name, 'members': g.members, 'tag': g.tag}).data)
