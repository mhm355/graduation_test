from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Define the Roles
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('DOCTOR', 'Doctor'),
        ('ADMIN', 'Admin'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    national_id = models.CharField(max_length=14, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"