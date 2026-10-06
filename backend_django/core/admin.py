"""
UniRide CTMS v2.0 — Core Admin Configuration
Registers User, StudentProfile, DriverProfile, Notification, and IncidentAlert
in Django Admin with search, filtering, and optimized list views.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, StudentProfile, DriverProfile, Notification, IncidentAlert


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "role", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["-date_joined"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("UniRide RBAC", {"fields": ("role", "phone")}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ["roll_number", "user", "bus_pass_active", "default_stop"]
    list_filter = ["bus_pass_active"]
    search_fields = ["roll_number", "user__username", "user__email"]
    raw_id_fields = ["user", "default_stop"]


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "license_number", "experience_years", "rating_score", "assigned_bus"]
    list_filter = ["experience_years"]
    search_fields = ["user__username", "license_number"]
    raw_id_fields = ["user", "assigned_bus"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "target_role", "is_emergency_broadcast", "created_at"]
    list_filter = ["target_role", "is_emergency_broadcast"]
    search_fields = ["title", "message"]


@admin.register(IncidentAlert)
class IncidentAlertAdmin(admin.ModelAdmin):
    list_display = ["alert_type", "severity", "driver", "bus", "is_resolved", "created_at"]
    list_filter = ["severity", "alert_type", "is_resolved"]
    search_fields = ["description"]
    raw_id_fields = ["driver", "bus"]
