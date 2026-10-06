"""
UniRide CTMS v2.0 — Core App Unit Tests
Validates User model, RBAC properties, serializers, JWT authentication,
profile auto-creation, notifications, and incident alerts.
"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from .models import StudentProfile, DriverProfile, Notification, IncidentAlert
from .serializers import RegisterSerializer, UserSerializer, NotificationSerializer

User = get_user_model()


class UserModelTests(TestCase):
    """Validates Custom User model with RBAC role properties."""

    def test_create_student_user(self):
        user = User.objects.create_user(
            username="test_student", email="student@test.com",
            password="TestPass123", role=User.Role.STUDENT
        )
        self.assertEqual(user.role, "STUDENT")
        self.assertTrue(user.is_student)
        self.assertFalse(user.is_driver)
        self.assertFalse(user.is_fleet_admin)

    def test_create_driver_user(self):
        user = User.objects.create_user(
            username="test_driver", email="driver@test.com",
            password="TestPass123", role=User.Role.DRIVER
        )
        self.assertTrue(user.is_driver)
        self.assertFalse(user.is_student)

    def test_create_admin_user(self):
        user = User.objects.create_user(
            username="test_admin", email="admin@test.com",
            password="TestPass123", role=User.Role.ADMIN
        )
        self.assertTrue(user.is_fleet_admin)

    def test_user_str_representation(self):
        user = User.objects.create_user(
            username="strtest", first_name="John", last_name="Doe",
            password="TestPass123", role=User.Role.STUDENT
        )
        self.assertIn("STUDENT", str(user))
        self.assertIn("John Doe", str(user))


class StudentProfileTests(TestCase):
    """Tests StudentProfile model creation and FK relationships."""

    def test_create_student_profile(self):
        user = User.objects.create_user(
            username="profile_student", password="TestPass123", role=User.Role.STUDENT
        )
        profile = StudentProfile.objects.create(
            user=user, roll_number="FA23-BCS-099", rfid_card_uid="AABB1122"
        )
        self.assertEqual(profile.roll_number, "FA23-BCS-099")
        self.assertTrue(profile.bus_pass_active)
        self.assertIn("FA23-BCS-099", str(profile))

    def test_roll_number_unique_constraint(self):
        user1 = User.objects.create_user(username="u1", password="TestPass123", role=User.Role.STUDENT)
        user2 = User.objects.create_user(username="u2", password="TestPass123", role=User.Role.STUDENT)
        StudentProfile.objects.create(user=user1, roll_number="FA23-BCS-001")
        with self.assertRaises(Exception):
            StudentProfile.objects.create(user=user2, roll_number="FA23-BCS-001")


class DriverProfileTests(TestCase):
    """Tests DriverProfile model."""

    def test_create_driver_profile(self):
        user = User.objects.create_user(username="drv_profile", password="TestPass123", role=User.Role.DRIVER)
        profile = DriverProfile.objects.create(
            user=user, license_number="ISB-DL-55555", experience_years=5, rating_score=4.8
        )
        self.assertEqual(profile.license_number, "ISB-DL-55555")
        self.assertEqual(profile.rating_score, 4.8)


@override_settings(
    DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    CHANNEL_LAYERS={"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}},
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}},
)
class AuthAPITests(APITestCase):
    """Integration tests for JWT authentication endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_register_student(self):
        data = {
            "username": "new_student",
            "email": "new@test.com",
            "first_name": "New",
            "last_name": "Student",
            "role": "STUDENT",
            "phone": "+92 300 0000000",
            "password": "StrongPass@123",
            "password_confirm": "StrongPass@123",
            "roll_number": "FA24-BCS-001",
        }
        response = self.client.post("/api/v1/auth/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="new_student").exists())
        # Auto-created StudentProfile
        user = User.objects.get(username="new_student")
        self.assertTrue(hasattr(user, "student_profile"))

    def test_register_password_mismatch(self):
        data = {
            "username": "fail_user",
            "email": "fail@test.com",
            "password": "StrongPass@123",
            "password_confirm": "WrongPass@456",
        }
        response = self.client.post("/api/v1/auth/register/", data, format="json")
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_and_jwt_token(self):
        User.objects.create_user(
            username="jwt_test", password="TestPass@123", role=User.Role.STUDENT
        )
        response = self.client.post("/api/v1/auth/login/", {
            "username": "jwt_test",
            "password": "TestPass@123",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_profile_requires_auth(self):
        response = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        user = User.objects.create_user(
            username="profile_test", password="TestPass@123",
            first_name="Profile", last_name="Test", role=User.Role.STUDENT
        )
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profile_test")


class NotificationTests(TestCase):
    """Tests for Notification model and query filtering."""

    def test_create_notification(self):
        notif = Notification.objects.create(
            title="Test Alert", message="Testing notification system",
            target_role=Notification.TargetRole.ALL
        )
        self.assertFalse(notif.is_emergency_broadcast)
        self.assertIn("Test Alert", str(notif))

    def test_emergency_broadcast(self):
        notif = Notification.objects.create(
            title="SOS", message="Emergency test",
            is_emergency_broadcast=True
        )
        self.assertIn("🚨", str(notif))


class IncidentAlertTests(TestCase):
    """Tests for incident alert system."""

    def test_create_incident(self):
        driver = User.objects.create_user(
            username="incident_driver", password="TestPass@123", role=User.Role.DRIVER
        )
        alert = IncidentAlert.objects.create(
            driver=driver,
            severity=IncidentAlert.Severity.CRITICAL,
            alert_type=IncidentAlert.AlertType.BREAKDOWN,
            description="Tire burst on IJP Road",
            latitude=33.67, longitude=73.08
        )
        self.assertFalse(alert.is_resolved)
        self.assertIn("CRITICAL", str(alert))
        self.assertIn("BREAKDOWN", str(alert))
