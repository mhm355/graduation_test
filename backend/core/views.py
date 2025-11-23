import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Course, Grade
from .serializers import CourseSerializer, GradeSerializer
from .models import News     
from .serializers import NewsSerializer
from rest_framework import generics
from .models import Attendance
from .serializers import AttendanceSerializer
from .models import Material
from .serializers import MaterialSerializer

User = get_user_model()

#  EXISTING VIEWS 

@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_grades(request):
    my_grades = Grade.objects.filter(student=request.user)
    serializer = GradeSerializer(my_grades, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_news(request):
    # Fetch only public news
    news = News.objects.filter(is_public=True)
    serializer = NewsSerializer(news, many=True)
    return Response(serializer.data)

# 1. Student: Get MY attendance
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_attendance(request):
    attendance = Attendance.objects.filter(student=request.user).order_by('-date')
    serializer = AttendanceSerializer(attendance, many=True)
    return Response(serializer.data)

# 2. Doctor: Upload Attendance Excel
class UploadAttendanceView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated] # 1. User must be logged in

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        try:
            df = pd.read_excel(file_obj)
            for index, row in df.iterrows():
                # Excel Columns: student_id, course_code, date (YYYY-MM-DD), status
                student_username = str(row['student_id'])
                course_code = row['course_code']
                
                # Handle Date Parsing (Ensure it is YYYY-MM-DD)
                raw_date = row['date']
                # If Excel gives a timestamp, convert to string
                if hasattr(raw_date, 'strftime'):
                    date_str = raw_date.strftime('%Y-%m-%d')
                else:
                    date_str = str(raw_date)

                status_val = row['status'] # Present/Absent

                # 1. Find the Course
                try:
                    course = Course.objects.get(code=course_code)
                except Course.DoesNotExist:
                     return Response({"error": f"Course {course_code} not found"}, status=404)

                # --- 2. SECURITY CHECK START ---
                # Check if this doctor owns this course
                if request.user.role == 'DOCTOR':
                    if course.doctor != request.user:
                         return Response(
                            {"error": f"Security Alert: You are not assigned to teach {course_code}."}, 
                            status=status.HTTP_403_FORBIDDEN
                        )
                # --- SECURITY CHECK END ---

                # 3. Find Student & Save
                try:
                    student = User.objects.get(username=student_username)
                    Attendance.objects.update_or_create(
                        student=student,
                        course=course,
                        date=date_str,
                        defaults={'status': status_val}
                    )
                except User.DoesNotExist:
                    print(f"Student {student_username} not found")

            return Response({"status": "Attendance uploaded successfully!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class UploadGradesView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated] # 1. User must be logged in

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        
        try:
            df = pd.read_excel(file_obj)
            
            for index, row in df.iterrows():
                student_username = str(row['student_id'])
                course_code = row['course_code']
                score = row['score']
                semester = row['semester']

                # 1. Find the Course
                try:
                    course = Course.objects.get(code=course_code)
                except Course.DoesNotExist:
                    return Response({"error": f"Course {course_code} does not exist"}, status=404)

                # --- 2. SECURITY CHECK START ---
                # If the user is a DOCTOR, check if they own this course.
                # Admins can upload for anyone, so we skip them.
                if request.user.role == 'DOCTOR':
                    if course.doctor != request.user:
                         return Response(
                            {"error": f"Security Alert: You are not assigned to teach {course_code}."}, 
                            status=status.HTTP_403_FORBIDDEN
                        )
                # --- SECURITY CHECK END ---

                try:
                    student = User.objects.get(username=student_username)
                    
                    Grade.objects.update_or_create(
                        student=student,
                        course=course,
                        defaults={'score': score, 'semester': semester}
                    )
                except User.DoesNotExist:
                    print(f"Student {student_username} not found")

            return Response({"status": "Grades uploaded successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 1. Doctor: Upload Material
class UploadMaterialView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        course_code = request.data.get('course_code')
        title = request.data.get('title')
        file = request.FILES.get('file')

        course = Course.objects.get(code=course_code)

        # Security Check
        if request.user.role == 'DOCTOR' and course.doctor != request.user:
            return Response({"error": "Not your course!"}, status=403)

        Material.objects.create(course=course, title=title, file=file)
        return Response({"status": "Material uploaded!"})

# 2. Student: View Materials for a specific course
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_materials(request, course_id):
    materials = Material.objects.filter(course_id=course_id)
    serializer = MaterialSerializer(materials, many=True)
    return Response(serializer.data)

class ManageGradesView(generics.ListCreateAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated] # In real app, check if user is Doctor

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_grade(request, pk):
    try:
        grade = Grade.objects.get(pk=pk)
    except Grade.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # We only want to update the 'score'
    grade.score = request.data.get('score', grade.score)
    grade.save()
    return Response({"status": "Grade updated", "score": grade.score})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_courses(request):
    # Security: Only return courses where the 'doctor' field matches the logged-in user
    if request.user.role == 'DOCTOR':
        courses = Course.objects.filter(doctor=request.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
    return Response({"error": "Authorized for Doctors only"}, status=403)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_material(request, pk):
    try:
        material = Material.objects.get(pk=pk)
        
        # SECURITY CHECK: Does this doctor own the course?
        if request.user.role == 'DOCTOR':
            if material.course.doctor != request.user:
                return Response({"error": "Access Denied"}, status=403)
        
        # Delete the file from disk
        material.file.delete() 
        # Delete the record from DB
        material.delete()
        
        return Response({"status": "File deleted"})
    except Material.DoesNotExist:
        return Response(status=404)