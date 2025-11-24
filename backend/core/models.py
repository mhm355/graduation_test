from django.db import models
from django.conf import settings

# 1. Department (e.g., Electrical, Civil)
class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

# 2. Academic Year (e.g., 2024-2025)
class AcademicYear(models.Model):
    year = models.CharField(max_length=20, unique=True) # "2024-2025"
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.year

# 3. Level (e.g., First Year, Second Year)
class Level(models.Model):
    name = models.CharField(max_length=50) # "Prep", "First", "Fourth"
    
    # Link Level to Department? (Optional, but good for "Electrical First Year")
    # For now, we keep Levels generic to be reused across departments.
    
    def __str__(self):
        return self.name

# 4. Course (Updated with Hierarchy)
class Course(models.Model):
    SEMESTER_CHOICES = (
        ('1', 'First Semester'),
        ('2', 'Second Semester'),
        ('Summer', 'Summer Semester'),
    )

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    credit_hours = models.IntegerField(default=3)
    
    # --- NEW HIERARCHY LINKS ---
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='courses', null=True)
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, default='1')
    
    # Note: We REMOVED 'doctor' from here. 
    # Why? Because a Course (Math 1) is static. 
    # The *Assignment* of a Doctor to a Course changes every Year.
    # We will handle "Doctor Assignment" in a separate table in Phase 2.

    def __str__(self):
        return f"{self.code} - {self.name}"

# --- Keep existing models below, but we might update them later ---

class Grade(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    score = models.FloatField(null=True, blank=True) # Allow empty grades initially
    semester = models.CharField(max_length=20)
    
    @property
    def letter_grade(self):
        if self.score is None: return 'N/A'
        if self.score >= 90: return 'A'
        elif self.score >= 85: return 'A-'
        elif self.score >= 75: return 'B'
        elif self.score >= 65: return 'C'
        elif self.score >= 50: return 'D'
        return 'F'

    def __str__(self):
        return f"{self.student} - {self.course}: {self.score}"

class Attendance(models.Model):
    STATUS_CHOICES = (('Present', 'Present'), ('Absent', 'Absent'))
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

class Material(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

# --- NEW MODEL: News/Events (Keep this if you had it) ---
class News(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True)