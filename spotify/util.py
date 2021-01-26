from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get, delete
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_id: str):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    return user_tokens[0] if user_tokens.exists() else None


def update_or_create_user_tokens(session_id: str, access_token: str, token_type: str, expires_in: int, refresh_token: str):
    tokens = get_user_tokens(session_id)
    date_expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = date_expires_in
        tokens.refresh_token = refresh_token
        tokens.save(update_fields=['access_token',
                                   'token_type', 'expires_in', 'refresh_token'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                              refresh_token=refresh_token, token_type=token_type, expires_in=date_expires_in)
        tokens.save()


def is_spotify_authenticated(session_id: str):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
    return bool(tokens)


def refresh_spotify_token(session_id: str):
    refresh_token: str = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token: str = response.get('access_token')
    token_type: str = response.get('token_type')
    expires_in = response.get('expires_in')
    if 'refresh_token' in response:
        refresh_token = response.get('refresh_token')

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id: str, endpoint: str, post_: bool = False, put_: bool = False, delete_: bool = False):
    tokens = get_user_tokens(session_id)
    header: dict[str, str] = {'Content-Type': 'application/json',
                              'Authorization': 'Bearer ' + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=header)
    elif put_:
        put(BASE_URL + endpoint, headers=header)
    elif delete_:
        delete(BASE_URL + endpoint, headers=header)
    else:
        response = get(BASE_URL + endpoint, {}, headers=header)
        try:
            return response.json()
        except:
            return {'Error': 'Issue with request'}
