from django.urls import path
from . import views

urlpatterns = [
    path('api/analyze-files/', views.analyze_files, name='analyze_files'),
    path('api/generate-audio/', views.generate_audio, name='generate_audio'),
    path('api/available-voices/', views.available_voices, name='available_voices'),
    path('api/prompt-based-music-generation/', views.generate_music_with_prompt, name='generate_music_with_prompt'),
    path('api/mix-audio/', views.mix_audio_endpoint, name='mix_audio'),
]