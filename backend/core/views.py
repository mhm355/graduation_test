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
from .models import TeachingAssignment
from .models import Certificate
from .serializers import CertificateSerializer
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

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
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=400)
        
        file_obj = request.FILES['file']
        try:
            df = pd.read_excel(file_obj)
            processed = 0
            
            for index, row in df.iterrows():
                try:
                    # 1. Read Columns
                    student_id = str(row['student_id']).strip()
                    course_name = str(row['course_name']).strip()
                    attended = int(row['attended_lectures']) # <--- NEW
                    total = int(row['total_lectures'])       # <--- NEW
                except KeyError as e:
                    return Response({"error": f"Missing column: {e}"}, status=400)

                # 2. Find Course by Name
                try:
                    course = Course.objects.get(name__iexact=course_name)
                except Course.DoesNotExist:
                    continue 

                # 3. Security Check
                if request.user.role == 'DOCTOR':
                    is_assigned = TeachingAssignment.objects.filter(
                        doctor=request.user, course=course
                    ).exists()
                    if not is_assigned:
                        return Response({"error": f"Security Alert: Not assigned to {course_name}"}, status=403)

                # 4. Update/Create Record
                try:
                    student = User.objects.get(username=student_id)
                    Attendance.objects.update_or_create(
                        student=student,
                        course=course,
                        defaults={
                            'attended_lectures': attended,
                            'total_lectures': total
                        }
                    )
                    processed += 1
                except User.DoesNotExist:
                    pass

            return Response({"status": f"Updated attendance for {processed} students!"}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        

class UploadGradesView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        
        try:
            df = pd.read_excel(file_obj)
            
            processed = 0
            skipped = 0
            
            for index, row in df.iterrows():
                try:
                    # 1. Read ALL Requested Columns
                    # Format: department | level | semester | student_id | student_name | course_name | score
                    dept_name = str(row['department']).strip()
                    level_name = str(row['level']).strip()
                    semester = str(row['semester']).strip()
                    course_name = str(row['course_name']).strip()
                    student_id = str(row['student_id']).strip()
                    student_name = str(row['student_name']).strip()
                    score = row['score']
                except KeyError as e:
                    return Response({"error": f"Missing required column: {e}"}, status=400)

                # 2. Find the Course by NAME
                try:
                    course = Course.objects.get(name__iexact=course_name)
                except Course.DoesNotExist:
                    print(f"Skipping: Course '{course_name}' not found.")
                    skipped += 1
                    continue

                # 3. Security Check (Doctor Ownership)
                if request.user.role == 'DOCTOR':
                    is_assigned = TeachingAssignment.objects.filter(
                        doctor=request.user, 
                        course=course
                    ).exists()
                    
                    if not is_assigned:
                         return Response(
                            {"error": f"Security Alert: You are not assigned to teach '{course_name}'."}, 
                            status=status.HTTP_403_FORBIDDEN
                        )

                # 4. Find Student & Save Grade
                try:
                    student = User.objects.get(username=student_id)
                    
                    # (Optional) Validate Student matches Dept/Level in Excel?
                    # For now, we trust the Student ID is correct.

                    Grade.objects.update_or_create(
                        student=student,
                        course=course,
                        defaults={'score': score, 'semester': semester}
                    )
                    processed += 1
                except User.DoesNotExist:
                    print(f"Student {student_id} ({student_name}) not found")
                    skipped += 1

            return Response({"status": f"Success! Processed: {processed}, Skipped: {skipped}"}, status=status.HTTP_201_CREATED)

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

        try:
            course = Course.objects.get(code=course_code)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        # --- SECURITY CHECK FIX START ---
        if request.user.role == 'DOCTOR':
            # Check the TeachingAssignment table instead of course.doctor
            is_assigned = TeachingAssignment.objects.filter(
                doctor=request.user, 
                course=course
            ).exists()
            
            if not is_assigned:
                return Response({"error": "Not your course! Assignment not found."}, status=403)
        # --- SECURITY CHECK FIX END ---

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
        # 1. Get all assignments for this doctor
        assignments = TeachingAssignment.objects.filter(doctor=request.user)
        
        data = []
        for assign in assignments:
            # 2. Build the course object manually
            # We grab the 'level' from the ASSIGNMENT, not the COURSE
            data.append({
                "id": assign.course.id,
                "code": assign.course.code,
                "name": assign.course.name,
                "credit_hours": assign.course.credit_hours,
                "department_name": assign.course.department.name,
                
                # --- CRITICAL FIX ---
                # Use the level from the Assignment (TeachingAssignment)
                "level_name": assign.level.name if assign.level else "N/A" 
            })
            
        return Response(data)
        
    return Response({"error": "Authorized for Doctors only"}, status=403)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_material(request, pk):
    try:
        material = Material.objects.get(pk=pk)
        
        # --- SECURITY CHECK FIX START ---
        # Check if this doctor is assigned to this course via the TeachingAssignment table
        if request.user.role == 'DOCTOR':
            is_assigned = TeachingAssignment.objects.filter(
                doctor=request.user, 
                course=material.course
            ).exists()
            
            if not is_assigned:
                return Response({"error": "Access Denied: You are not assigned to this course."}, status=403)
        # --- SECURITY CHECK FIX END ---
        
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

    def perform_create(self, serializer):
        # 1. ENFORCEMENT: Check if maximum level limit is reached (5 levels total)
        if Level.objects.count() >= 5:
            raise ValidationError("Maximum of 5 academic levels already exist. Cannot create more.")
        
        # 2. Proceed with creation
        serializer.save()

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


# 1. Update ManageGradesView to filter by course
class ManageGradesView(generics.ListCreateAPIView):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter by course_id if provided in URL
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Grade.objects.filter(course_id=course_id)
        return Grade.objects.all() # Fallback

# 2. Add ManageAttendanceView (New)
class ManageAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Attendance.objects.filter(course_id=course_id)
        return Attendance.objects.none()

# 1. Staff: Upload Certificate
class UploadCertificateView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. Permission Check (Only Staff or Admin)
        if request.user.role not in ['STAFF_AFFAIRS', 'ADMIN']:
            return Response({"error": "Unauthorized. Only Staff Affairs can upload certificates."}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        file = request.FILES.get('file')

        if not student_id or not file:
            return Response({"error": "Student ID and File are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = User.objects.get(username=student_id)
            
            # 2. Eligibility Check (Student must be 4th Year)
            # This relies on the 'level' being set correctly during student registration
            if student.level and student.level.name != "Fourth Year":
                return Response(
                    {"error": f"Student is in {student.level.name}. Certificates are for Fourth Year only."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 3. Create or Update (Overwrite old certificate)
            # OneToOneField ensures only one certificate per student.
            # We use try/except for OneToOneField integrity
            try:
                cert, created = Certificate.objects.update_or_create(
                    student=student,
                    defaults={'file': file}
                )
                
                return Response({"status": f"Certificate uploaded successfully! {'Created' if created else 'Updated'}."}, status=status.HTTP_201_CREATED)
            
            except IntegrityError:
                 return Response({"error": "Certificate already exists for this student."}, status=status.HTTP_400_BAD_REQUEST)


        except User.DoesNotExist:
            return Response({"error": "Student not found with that ID."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             # Catch general errors (like file write issues)
             return Response({"error": f"An unknown error occurred during save: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 2. Restrict Download (Student Logic)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_certificate(request):
    
    # --- NEW SECURITY CHECK ---
    if request.user.level.name != "Fourth Year":
        return Response({"error": "You are not eligible for a certificate yet."}, status=403)
    # --------------------------

    try:
        cert = Certificate.objects.get(student=request.user)
        serializer = CertificateSerializer(cert)
        return Response(serializer.data)
    except Certificate.DoesNotExist:
        return Response({"error": "No certificate found"}, status=404)

