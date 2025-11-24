from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # 1. Show these columns in the main list
    list_display = ('username', 'first_name', 'role', 'department', 'level')
    
    # 2. Show these fields in the "Edit User" form
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'national_id', 'department', 'level')}),
    )
    
    # 3. Show these fields in the "Add User" form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'national_id', 'department', 'level')}),
    )