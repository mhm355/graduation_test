from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.get_courses, name='get_courses'),
    path('my-grades/', views.get_my_grades, name='get_my_grades'),
]