from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Course, Grade
from .serializers import CourseSerializer, GradeSerializer

# 1. Public API: List all courses (Anyone can see this)
@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

# 2. Private API: Get MY grades (Only logged-in students)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_grades(request):
    # 'request.user' is the student currently logged in
    my_grades = Grade.objects.filter(student=request.user)
    serializer = GradeSerializer(my_grades, many=True)
    return Response(serializer.data)