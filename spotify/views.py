from django.shortcuts import redirect
from .credentials import *
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-modify user-library-read'

        url: str = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code: str = request.GET.get('code')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token: str = response.get('access_token')
    token_type: str = response.get('token_type')
    refresh_token: str = response.get('refresh_token')
    expires_in = response.get('expires_in')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated: bool = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code: str = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if queryset.exists():
            room = queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        response = execute_spotify_api_request(room.host, 'player')

        try:
            item = response.get('item')
            duration: int = item.get('duration_ms')
            progress: int = response.get('progress_ms')
            album_cover: str = item.get('album').get('images')[0].get('url')
            is_playing: bool = response.get('is_playing')
            song_id: str = item.get('id')
            volume: int = response.get('device').get('volume_percent')
            repeat_state: str = response.get('repeat_state')
            shuffle_state: bool = response.get('shuffle_state')
        except AttributeError:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        artist_string: str = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name: str = artist.get('name')
            artist_string += name

        votes = Vote.objects.filter(room=room, song_id=song_id)
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': len(votes),
            'id': song_id,
            'volume': volume,
            'repeat_state': repeat_state,
            'shuffle_state': shuffle_state,
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            execute_spotify_api_request(room.host, 'player/pause', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            execute_spotify_api_request(room.host, 'player/play', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_to_skip = room.votes_to_skip

        if not Vote.objects.filter(user=self.request.session.session_key).exists():
            if self.request.session.session_key == room.host or len(votes) + 1 >= votes_to_skip:
                votes.delete()
                execute_spotify_api_request(
                    room.host, 'player/next', post_=True)
                return Response({'voted': False}, status=status.HTTP_200_OK)
            else:
                vote = Vote(user=self.request.session.session_key,
                            room=room, song_id=room.current_song)
                vote.save()
                return Response({'voted': True}, status=status.HTTP_200_OK)

        Vote.objects.filter(user=self.request.session.session_key).delete()
        return Response({'voted': False}, status=status.HTTP_200_OK)


class PreviousSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, 'player/previous', post_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class Seek(APIView):
    def put(self, request, format=None):
        time = self.request.GET.get('time')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, f'player/seek?position_ms={time}', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SetVolume(APIView):
    def put(self, request, format=None):
        new_volume = self.request.GET.get('new_volume')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, f'player/volume?volume_percent={new_volume}', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SetRepeat(APIView):
    def put(self, request, format=None):
        state = self.request.GET.get('state')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, f'player/repeat?state={state}', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SetShuffle(APIView):
    def put(self, request, format=None):
        state = self.request.GET.get('state')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, f'player/shuffle?state={state}', put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class Favorite(APIView):
    def put(self, request, format=None):
        song_id = self.request.GET.get('song_id')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            execute_spotify_api_request(
                room.host, f'tracks?ids={song_id}', put_=True)
            return Response({}, status=status.HTTP_200_OK)

        return Response({}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, format=None):
        song_id = self.request.GET.get('song_id')
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            response = execute_spotify_api_request(
                room.host, f'tracks?ids={song_id}', delete_=True)
            return Response({}, status=response)

        return Response({}, status=status.HTTP_403_FORBIDDEN)
