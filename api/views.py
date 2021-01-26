from rest_framework import generics, status
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        code = request.GET.get('code')
        if code:
            queryset = Room.objects.filter(code=code)
            if queryset.exists():
                room = queryset[0]
                data = RoomSerializer(room).data
                data['is_host'] = self.request.session.session_key == room.host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'None Code Parameter'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get('code')
        queryset = Room.objects.filter(code=code)
        if code and queryset.exists():
            self.request.session['room_code'] = code
            return Response({'message': 'Room joined!'}, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {'code': self.request.session.get('room_code')}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            queryset = Room.objects.filter(host=host_id)
            if queryset.exists():
                room = queryset[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateView(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            try:
                room = Room.objects.filter(code=code)[0]
            except:
                return Response({'msg': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': "Ur not this room's host"}, status=status.HTTP_HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class BetterRoomView(generics.ListAPIView):
    queryset = BetterRoom.objects.all()
    serializer_class = BetterRoomSerializer


class BetterCreateRoomView(APIView):
    serializer_class = BetterCreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guests_can_pause = serializer.data.get('guests_can_pause') or False
            guests_skip_state = serializer.data.get(
                'votes_to_skip') or 'Votes: 2'
            host = self.request.session.session_key
            queryset = BetterRoom.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guests_can_pause = guests_can_pause
                room.guests_skip_state = guests_skip_state
                room.save(update_fields=[
                          'guests_can_pause', 'guests_skip_state'])
                self.request.session['code'] = room.code
                return Response(BetterRoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = BetterRoom(host=host, guests_can_pause=guests_can_pause,
                                  guests_skip_state=guests_skip_state)
                room.save()
                self.request.session['code'] = room.code
                return Response(BetterRoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class BetterJoinRoomView(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get('code')
        queryset = BetterRoom.objects.filter(code=code)
        if code and queryset.exists():
            self.request.session['code'] = code
            return Response({'message': 'Room joined!'}, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
