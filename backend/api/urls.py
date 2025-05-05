from django.urls import path
from . import views

urlpatterns = [
    path('api/analyze-files/', views.analyze_files, name='analyze_files'),
    path('api/generate-audio/', views.generate_audio, name='generate_audio'),
    path('api/available-voices/', views.available_voices, name='available_voices'),
    path('api/prompt-based-music-generation', views.generate_music_with_prompt, name='prompt_based_music_generation'),
    # path('api/music-structures/', views.get_music_structures, name='music_structures'),
    # path('api/catalog-songs/', views.get_catalog_songs, name='catalog_songs'),
]