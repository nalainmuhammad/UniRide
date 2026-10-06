"""
UniRide CTMS v2.0 — Core Serializers
JWT authentication, user registration, and profile management.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import StudentProfile, DriverProfile, Notification, IncidentAlert

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enrich JWT token with user role and profile data."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.get_full_name()
        token["email"] = user.email
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "phone", "is_active", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "role", "phone", "password", "password_confirm"]

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "roll_number", "rfid_card_uid", "emergency_contact",
            "address", "default_stop", "bus_pass_active", "qr_code_path",
        ]
        read_only_fields = ["id"]


class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DriverProfile
        fields = ["id", "user", "license_number", "experience_years", "rating_score", "assigned_bus"]
        read_only_fields = ["id", "rating_score"]


class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "title", "message", "target_role", "is_emergency_broadcast",
            "created_at", "is_read",
        ]
        read_only_fields = ["id", "created_at"]

    def get_is_read(self, obj: Notification) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.read_by.filter(id=request.user.id).exists()
        return False


class IncidentAlertSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.get_full_name", read_only=True)

    class Meta:
        model = IncidentAlert
        fields = [
            "id", "driver", "driver_name", "bus", "severity", "alert_type",
            "description", "latitude", "longitude", "is_resolved", "created_at",
        ]
        read_only_fields = ["id", "created_at", "driver"]
