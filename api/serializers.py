from rest_framework import serializers
from .models import *


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause',
                  'votes_to_skip', 'created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')


class BetterRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = BetterRoom
        fields = ('id', 'code', 'host', 'guests_can_pause',
                  'guests_skip_state', 'created_at')


class BetterCreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = BetterRoom
        fields = ('guests_can_pause', 'guests_skip_state')
