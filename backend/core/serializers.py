from rest_framework import serializers
from .models import Department, Course, Grade

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code']

class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'credit_hours', 'department_name']

class GradeSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Grade
        fields = ['id', 'course_name', 'course_code', 'score', 'letter_grade', 'semester']