
from django.contrib import admin, messages
from .models import Department, Course, Grade, News, Attendance, Material, AcademicYear, Level, DeletionRequest, TeachingAssignment
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'credit_hours')
    list_filter = ('department',) # Adds a filter sidebar

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'score', 'semester', 'letter_grade')
    list_filter = ('course', 'semester')
    search_fields = ('student__username', 'course__code')

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'is_public')
    list_filter = ('is_public',)

@admin.register(DeletionRequest)
class DeletionRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'target_type', 'target_name', 'created_at', 'is_approved')
    actions = ['approve_deletion']

    @admin.action(description='Approve selected deletion requests')
    def approve_deletion(self, request, queryset):
        for req in queryset:
            if req.is_approved:
                continue # Skip if already done

            try:
                # 1. Find the item to delete
                if req.target_type == 'YEAR':
                    item = AcademicYear.objects.get(id=req.target_id)
                elif req.target_type == 'LEVEL':
                    item = Level.objects.get(id=req.target_id)
                
                # 2. Delete it
                item.delete()
                
                # 3. Mark request as approved
                req.is_approved = True
                req.save()
                self.message_user(request, f"Deleted {req.target_type}: {req.target_name}", messages.SUCCESS)
            
            except (AcademicYear.DoesNotExist, Level.DoesNotExist):
                self.message_user(request, f"Item {req.target_name} already deleted or not found.", messages.WARNING)
                req.delete() # Clean up invalid request

@admin.register(TeachingAssignment)
class TeachingAssignmentAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'course', 'academic_year', 'level', 'semester')
    list_filter = ('academic_year', 'level', 'semester', 'doctor')
    search_fields = ('doctor__username', 'course__name')