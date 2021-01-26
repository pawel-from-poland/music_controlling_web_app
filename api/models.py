from django.db import models
import string
import random


def generate_unique_code():
    length = 6

    while True:
        code = ''.join(random.choices(string.ascii_lowercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            return code


class Room(models.Model):
    code = models.CharField(
        max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=2)
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length=50, null=True)


class BetterRoom(models.Model):
    code = models.CharField(
        max_length=6, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guests_can_pause = models.BooleanField(null=False, default=False)
    guests_skip_state = models.CharField(
        null=False, max_length=50, default='Voting: 2')
    created_at = models.DateTimeField(auto_now_add=True)
    current_song_id = models.CharField(max_length=50)
