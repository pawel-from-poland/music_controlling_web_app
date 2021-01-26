from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
    path('skip', SkipSong.as_view()),
    path('previous', PreviousSong.as_view()),
    path('seek', Seek.as_view()),
    path('set-volume', SetVolume.as_view()),
    path('set-repeat', SetRepeat.as_view()),
    path('set-shuffle', SetShuffle.as_view()),
    path('favorite', Favorite.as_view()),
]
