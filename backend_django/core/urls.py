"""
UniRide CTMS v2.0 — Core URL Configuration
Authentication, profiles, notifications, and incidents under /api/v1/auth/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Authentication
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.RegisterView.as_view(), name="register"),

    # Profile
    path("profile/", views.profile_view, name="profile"),

    # Notifications
    path("notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", views.mark_notification_read, name="notification-read"),

    # Incidents
    path("incidents/", views.IncidentAlertListCreateView.as_view(), name="incident-list"),
    path("incidents/<int:pk>/resolve/", views.IncidentAlertResolveView.as_view(), name="incident-resolve"),
]
