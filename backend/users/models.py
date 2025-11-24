from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('DOCTOR', 'Doctor'),
        ('STAFF_AFFAIRS', 'Staff Affairs'), 
        ('ADMIN', 'Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    national_id = models.CharField(max_length=14, blank=True, null=True)

    department = models.ForeignKey('core.Department', on_delete=models.SET_NULL, null=True, blank=True)
    level = models.ForeignKey('core.Level', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    def __str__(self):
        return f"{self.username} ({self.role})"