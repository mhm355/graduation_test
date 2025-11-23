from django.contrib import admin
from .models import Department, Course, Grade, News

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'credit_hours')
    list_filter = ('department',) # Adds a filter sidebar

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'score', 'semester', 'letter_grade')
    list_filter = ('course', 'semester')
    search_fields = ('student__username', 'course__code')

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'is_public')
    list_filter = ('is_public',)