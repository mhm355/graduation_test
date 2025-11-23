from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.get_courses, name='get_courses'),
    path('my-grades/', views.get_my_grades, name='get_my_grades'),
    path('upload-grades/', views.UploadGradesView.as_view(), name='upload_grades'),
    path('news/', views.get_news, name='get_news'),
    path('doctor/grades/', views.ManageGradesView.as_view(), name='doctor_grades'),
    path('doctor/grades/<int:pk>/update/', views.update_grade, name='update_grade'),
    path('my-attendance/', views.get_my_attendance, name='get_my_attendance'),
    path('upload-attendance/', views.UploadAttendanceView.as_view(), name='upload_attendance'),
    path('upload-material/', views.UploadMaterialView.as_view(), name='upload_material'),
    path('courses/<int:course_id>/materials/', views.get_course_materials, name='get_course_materials'),
    path('doctor/courses/', views.get_doctor_courses, name='get_doctor_courses'),
    path('material/<int:pk>/delete/', views.delete_material, name='delete_material'),
]