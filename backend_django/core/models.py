"""
UniRide CTMS v2.0 — Core Models
Custom User model with RBAC, Student/Driver profiles ported from legacy ASP.NET models.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """
    Custom user extending Django's AbstractUser.
    Ported from legacy User.cs with enhanced role-based access control.
    """

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        DRIVER = "DRIVER", "Driver"
        ADMIN = "ADMIN", "Administrator"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self) -> str:
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_student(self) -> bool:
        return self.role == self.Role.STUDENT

    @property
    def is_driver(self) -> bool:
        return self.role == self.Role.DRIVER

    @property
    def is_fleet_admin(self) -> bool:
        return self.role == self.Role.ADMIN


class StudentProfile(models.Model):
    """
    Extended student profile linked 1:1 to User.
    Ported from legacy Student.cs — preserves roll number, QR path, route/bus FK.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    roll_number = models.CharField(max_length=50, unique=True)
    rfid_card_uid = models.CharField(max_length=64, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=200, blank=True)
    default_stop = models.ForeignKey(
        "transit.Stop", on_delete=models.SET_NULL, null=True, blank=True, related_name="students"
    )
    bus_pass_active = models.BooleanField(default=True)
    qr_code_path = models.CharField(max_length=300, blank=True)

    class Meta:
        db_table = "student_profiles"

    def __str__(self) -> str:
        return f"{self.roll_number} — {self.user.get_full_name()}"


class DriverProfile(models.Model):
    """
    Extended driver profile linked 1:1 to User.
    Ported from legacy Driver.cs — preserves license, bus assignment.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="driver_profile")
    license_number = models.CharField(max_length=50, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    rating_score = models.FloatField(
        default=5.0, validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]
    )
    assigned_bus = models.ForeignKey(
        "transit.Bus", on_delete=models.SET_NULL, null=True, blank=True, related_name="drivers"
    )

    class Meta:
        db_table = "driver_profiles"

    def __str__(self) -> str:
        return f"Driver: {self.user.get_full_name()} (License: {self.license_number})"


class Notification(models.Model):
    """
    System-wide notification/announcement.
    Ported from legacy Notification.cs + NotificationRead.cs.
    """

    class TargetRole(models.TextChoices):
        ALL = "ALL", "All Users"
        STUDENT = "STUDENT", "Students Only"
        DRIVER = "DRIVER", "Drivers Only"
        ADMIN = "ADMIN", "Admins Only"

    title = models.CharField(max_length=200)
    message = models.TextField()
    target_role = models.CharField(max_length=10, choices=TargetRole.choices, default=TargetRole.ALL)
    is_emergency_broadcast = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(User, blank=True, related_name="read_notifications")

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{'🚨 ' if self.is_emergency_broadcast else ''}{self.title}"


class IncidentAlert(models.Model):
    """
    Driver-initiated emergency/incident report.
    Ported from legacy Report.cs with enhanced severity levels.
    """

    class Severity(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        CRITICAL = "CRITICAL", "Critical"

    class AlertType(models.TextChoices):
        BREAKDOWN = "BREAKDOWN", "Vehicle Breakdown"
        ACCIDENT = "ACCIDENT", "Accident"
        MEDICAL = "MEDICAL", "Medical Emergency"
        SECURITY = "SECURITY", "Security Threat"
        OTHER = "OTHER", "Other"

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="incident_alerts")
    bus = models.ForeignKey(
        "transit.Bus", on_delete=models.SET_NULL, null=True, related_name="incident_alerts"
    )
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    alert_type = models.CharField(max_length=15, choices=AlertType.choices, default=AlertType.OTHER)
    description = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "incident_alerts"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"[{self.severity}] {self.alert_type} by {self.driver}"
