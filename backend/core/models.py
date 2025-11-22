from django.db import models
from django.conf import settings # To link to the Student User

class Department(models.Model):
    name = models.CharField(max_length=100) # e.g., "Electrical Engineering"
    code = models.CharField(max_length=10, unique=True) # e.g., "EE"

    def __str__(self):
        return self.name

class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=100) # e.g., "Circuits 1"
    code = models.CharField(max_length=20, unique=True) # e.g., "EE101"
    credit_hours = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Grade(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    score = models.FloatField() # e.g., 85.5
    semester = models.CharField(max_length=20) # e.g., "Fall 2025"
    
    # Optional: Convert score to Letter Grade (A, B, C)
    @property
    def letter_grade(self):
        if self.score >= 90: return 'A'
        elif self.score >= 85: return 'A-'
        elif self.score >= 75: return 'B'
        elif self.score >= 65: return 'C'
        elif self.score >= 50: return 'D'
        return 'F'

    def __str__(self):
        return f"{self.student} - {self.course}: {self.score}"