from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    return user_tokens[0] if user_tokens.exists() else None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens and len(tokens.access_token) > 2:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.refresh_token = refresh_token
        tokens.save(update_fields=['access_token',
                                   'token_type', 'expires_in', 'refresh_token'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                              refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
    return bool(tokens)


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    if 'refresh_token' in response:
        refresh_token = response.get('refresh_token')

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    header = {'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=header)
    elif put_:
        put(BASE_URL + endpoint, headers=header)
    else:
        response = get(BASE_URL + endpoint, {}, headers=header)
        try:
            return response.json()
        except:
            return {'Error': 'Issue with request'}


def play_song(session_id): return execute_spotify_api_request(
    session_id, 'player/play', put_=True)


def pause_song(session_id): return execute_spotify_api_request(
    session_id, 'player/pause', put_=True)


def skip_song(session_id): return execute_spotify_api_request(
    session_id, 'player/next', post_=True)


def previous_song(session_id): return execute_spotify_api_request(
    session_id, 'player/previous', post_=True)


def seek(session_id, time): return execute_spotify_api_request(
    session_id, f'player/seek?position_ms={time}', put_=True)


def set_volume(session_id, new_volume): return execute_spotify_api_request(
    session_id, f'player/volume?volume_percent={new_volume}', put_=True)


def set_repeat(session_id, state): return execute_spotify_api_request(
    session_id, f'player/repeat?state={state}', put_=True)
