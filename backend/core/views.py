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
from .models import Department, AcademicYear, Level
from .serializers import DepartmentSerializer, AcademicYearSerializer, LevelSerializer
from users.serializers import StudentSerializer
from users.models import User
from .models import DeletionRequest

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
    if request.user.role == 'DOCTOR':
        # OLD WAY: courses = Course.objects.filter(doctor=request.user)
        
        # NEW WAY: Get assignments for this doctor
        assignments = TeachingAssignment.objects.filter(doctor=request.user)
        
        # We need to extract the 'course' from each assignment
        # But we also want to know which Year/Level they are assigned to!
        
        data = []
        for assign in assignments:
            data.append({
                "id": assign.course.id,
                "code": assign.course.code,
                "name": assign.course.name,
                "department_name": assign.course.department.name,
                "credit_hours": assign.course.credit_hours,
                # Extra info from the assignment
                "assigned_year": assign.academic_year.year,
                "assigned_level": assign.level.name,
                "assigned_semester": assign.semester,
            })
            
        return Response(data)
        
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

# 1. Manage Departments
class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated] # In real app, add IsStaffAffairs permission

# 2. Manage Academic Years
class AcademicYearListCreateView(generics.ListCreateAPIView):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]

# 3. Manage Levels
class LevelListCreateView(generics.ListCreateAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsAuthenticated]

class UploadStudentsView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated] 

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=400)

        file_obj = request.FILES['file']
        try:
            df = pd.read_excel(file_obj)
            
            created_count = 0
            updated_count = 0
            
            for index, row in df.iterrows():
                # 1. Read Columns (We use .get() or handle missing keys safely if needed)
                # We expect: department, level, semester, student_id, student_name
                
                # Clean the data (convert to string and remove spaces)
                dept_name = str(row['department']).strip()
                level_name = str(row['level']).strip()
                username = str(row['student_id']).strip()
                full_name = str(row['student_name']).strip()
                
                # 2. Find Department & Level
                try:
                    # Case-insensitive search (__iexact) helps with "Electrical" vs "electrical"
                    department = Department.objects.get(name__iexact=dept_name)
                    level = Level.objects.get(name__iexact=level_name)
                except (Department.DoesNotExist, Level.DoesNotExist):
                    # If Dept/Level wrong, skip this student
                    print(f"Skipping {username}: Dept '{dept_name}' or Level '{level_name}' not found.")
                    continue

                # 3. Create or Update User
                user, created = User.objects.update_or_create(
                    username=username,
                    defaults={
                        'first_name': full_name,
                        'role': 'STUDENT',
                        'department': department,
                        'level': level,
                    }
                )
                
                if created:
                    user.set_password(username) # Set Password = Student ID
                    user.save()
                    created_count += 1
                else:
                    updated_count += 1
            
            return Response({"status": f"Processed: {created_count} Created, {updated_count} Updated."})
        except Exception as e:
            # This catches errors like missing columns
            return Response({"error": str(e)}, status=400)

# 1. List Students (Filtered)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_students(request):
    dept_name = request.query_params.get('dept')
    level_name = request.query_params.get('level')
    
    students = User.objects.filter(role='STUDENT')
    
    if dept_name:
        students = students.filter(department__name__iexact=dept_name)
    if level_name:
        students = students.filter(level__name__iexact=level_name)
        
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)

# 2. Edit/Delete Student
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_student(request, pk):
    try:
        student = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=404)

    if request.method == 'DELETE':
        student.delete()
        return Response({"status": "Student deleted"})

    elif request.method == 'PUT':
        # Allow updating Name and ID
        student.first_name = request.data.get('first_name', student.first_name)
        student.username = request.data.get('username', student.username) # Student ID
        student.save()
        return Response({"status": "Student updated"})

# 1. Year Delete Logic
class AcademicYearDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # If user is Admin, delete immediately
        if request.user.role == 'ADMIN':
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        # If Staff, create a REQUEST instead
        DeletionRequest.objects.create(
            requester=request.user,
            target_type='YEAR',
            target_id=instance.id,
            target_name=instance.year
        )
        return Response({"status": "Deletion request sent to Admin for approval."}, status=status.HTTP_202_ACCEPTED)

# 2. Level Delete Logic
class LevelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if request.user.role == 'ADMIN':
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        DeletionRequest.objects.create(
            requester=request.user,
            target_type='LEVEL',
            target_id=instance.id,
            target_name=instance.name
        )
        return Response({"status": "Deletion request sent to Admin for approval."}, status=status.HTTP_202_ACCEPTED)