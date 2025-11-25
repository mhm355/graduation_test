from rest_framework import serializers
from .models import Department, AcademicYear, Level, Course, Grade, News, Attendance, Material, Certificate, Exam
from rest_framework.fields import SerializerMethodField

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
    level_name = serializers.CharField(source='level.name', read_only=True, default="N/A")
    
    # --- NEW FIELDS ---
    student_grade = serializers.SerializerMethodField()
    student_attendance = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name', 'credit_hours', 'department_name', 'level_name',
            'student_grade', 'student_attendance' # <--- Add them
        ]

    def get_student_grade(self, obj):
        user = self.context.get('request').user
        if user.is_anonymous: return None
        try:
            # Find grade for this specific student and course
            grade = Grade.objects.get(student=user, course=obj)
            return {"score": grade.score, "letter": grade.letter_grade}
        except Grade.DoesNotExist:
            return None

    def get_student_attendance(self, obj):
        user = self.context.get('request').user
        if user.is_anonymous: return None
        try:
            # Find attendance for this specific student and course
            att = Attendance.objects.get(student=user, course=obj)
            return {"percentage": att.percentage, "attended": att.attended_lectures, "total": att.total_lectures}
        except Attendance.DoesNotExist:
            return None
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

class Exam(models.Model):
    EXAM_TYPES = (('Midterm', 'Midterm'), ('Final', 'Final'), ('Quiz', 'Quiz'))
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    exam_type = models.CharField(max_length=10, choices=EXAM_TYPES, default='Midterm')
    date = models.DateField()
    time = models.TimeField()
    duration_minutes = models.IntegerField(default=90) # 1.5 Hours default
    location = models.CharField(max_length=100) # e.g. "Hall 3, Building B"

    def __str__(self):
        return f"{self.course.code} {self.exam_type} - {self.date}"