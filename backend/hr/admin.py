from django.contrib import admin

from .models import Activity, Department, Employee, LeaveRequest

admin.site.register(Department)
admin.site.register(Activity)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "email", "department", "status")
    list_filter = ("status", "department")
    search_fields = ("first_name", "last_name", "email", "employee_id")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "status")
    list_filter = ("status", "leave_type")
