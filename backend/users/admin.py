from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Columns to show in the list
    list_display = ('username', 'email', 'role', 'is_staff')
    
    # Add 'role' and 'national_id' to the Edit User form
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'national_id')}),
    )
    
    # Add 'role' and 'national_id' to the Add User form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'national_id')}),
    )