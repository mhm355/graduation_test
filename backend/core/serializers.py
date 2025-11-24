from rest_framework import serializers
from .models import Department, AcademicYear, Level, Course, Grade, News, Attendance, Material, Certificate

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = '__all__'
class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'credit_hours', 'department_name']

class GradeSerializer(serializers.ModelSerializer):
    # Existing fields
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    # --- NEW FIELDS: Fetch from the Student User ---
    student_id = serializers.CharField(source='student.username', read_only=True)
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    department = serializers.CharField(source='student.department.name', read_only=True, default="-")
    level = serializers.CharField(source='student.level.name', read_only=True, default="-")

    class Meta:
        model = Grade
        fields = [
            'id', 'score', 'letter_grade', 'semester', 'course_name', 'course_code',
            'student_id', 'student_name', 'department', 'level' # <--- Add them here
        ]

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'course_name', 'course_code', 'attended_lectures', 'total_lectures', 'percentage']

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'title', 'file', 'uploaded_at']

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    
    class Meta:
        model = Certificate
        fields = ['id', 'student', 'student_name', 'file', 'uploaded_at']