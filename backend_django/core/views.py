"""
UniRide CTMS v2.0 — Core Views
Authentication, registration, profile management, notifications, and incidents.
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import StudentProfile, DriverProfile, Notification, IncidentAlert
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    StudentProfileSerializer,
    DriverProfileSerializer,
    NotificationSerializer,
    IncidentAlertSerializer,
)

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════════

class CustomTokenObtainPairView(TokenObtainPairView):
    """JWT login with enriched token payload (role, name, email)."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user (student, driver, or admin)."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer) -> None:
        user = serializer.save()
        # Auto-create profile based on role
        if user.role == User.Role.STUDENT:
            StudentProfile.objects.create(
                user=user,
                roll_number=self.request.data.get("roll_number", f"AUTO-{user.id}"),
            )
        elif user.role == User.Role.DRIVER:
            DriverProfile.objects.create(
                user=user,
                license_number=self.request.data.get("license_number", ""),
            )


# ═══════════════════════════════════════════════════════════════════════════
# USER PROFILE
# ═══════════════════════════════════════════════════════════════════════════

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Get authenticated user's profile with role-specific data."""
    user = request.user
    data = UserSerializer(user).data

    if user.is_student and hasattr(user, "student_profile"):
        data["student_profile"] = StudentProfileSerializer(user.student_profile).data
    elif user.is_driver and hasattr(user, "driver_profile"):
        data["driver_profile"] = DriverProfileSerializer(user.driver_profile).data

    return Response(data)


# ═══════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════

class NotificationListView(generics.ListCreateAPIView):
    """List notifications for the current user's role, or create new ones (admin only)."""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            target_role__in=["ALL", user.role]
        ).select_related().prefetch_related("read_by")

    def perform_create(self, serializer) -> None:
        if not self.request.user.is_fleet_admin:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can create notifications.")
        serializer.save()


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk: int):
    """Mark a notification as read for the current user."""
    try:
        notification = Notification.objects.get(pk=pk)
    except Notification.DoesNotExist:
        return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

    notification.read_by.add(request.user)
    return Response({"detail": "Marked as read."})


# ═══════════════════════════════════════════════════════════════════════════
# INCIDENT ALERTS
# ═══════════════════════════════════════════════════════════════════════════

class IncidentAlertListCreateView(generics.ListCreateAPIView):
    """List all incidents (admin) or create SOS alerts (drivers)."""
    serializer_class = IncidentAlertSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_fleet_admin:
            return IncidentAlert.objects.all()
        return IncidentAlert.objects.filter(driver=user)

    def perform_create(self, serializer) -> None:
        serializer.save(driver=self.request.user)


class IncidentAlertResolveView(generics.UpdateAPIView):
    """Resolve an incident alert (admin only)."""
    serializer_class = IncidentAlertSerializer
    queryset = IncidentAlert.objects.all()

    def perform_update(self, serializer) -> None:
        serializer.save(is_resolved=True)
