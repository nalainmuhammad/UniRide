"""
UniRide CTMS v2.0 — Transit Serializers
REST serializers for fleet operations, routes, schedules, bookings, and attendance.
"""

from rest_framework import serializers
from .models import Bus, Route, Stop, RouteStop, Schedule, Attendance, Booking, Waitlist, Feedback


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ["id", "name", "code", "latitude", "longitude", "address", "is_active"]


class RouteStopSerializer(serializers.ModelSerializer):
    stop = StopSerializer(read_only=True)
    stop_id = serializers.PrimaryKeyRelatedField(queryset=Stop.objects.all(), source="stop", write_only=True)

    class Meta:
        model = RouteStop
        fields = ["id", "sequence_order", "distance_from_start_km", "estimated_minutes_from_start", "stop", "stop_id"]


class RouteSerializer(serializers.ModelSerializer):
    route_stops = RouteStopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            "id", "name", "code", "origin", "destination", "total_distance_km",
            "estimated_duration_min", "polyline_coordinates", "is_active", "route_stops",
        ]


class BusSerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)

    class Meta:
        model = Bus
        fields = [
            "id", "bus_number", "registration_plate", "capacity", "current_occupancy",
            "available_seats", "model_name", "status", "current_latitude",
            "current_longitude", "current_speed", "last_telemetry_at", "is_active",
        ]


class ScheduleSerializer(serializers.ModelSerializer):
    bus_details = BusSerializer(source="bus", read_only=True)
    route_name = serializers.CharField(source="route.name", read_only=True)
    driver_name = serializers.CharField(source="driver.get_full_name", read_only=True)

    class Meta:
        model = Schedule
        fields = [
            "id", "bus", "bus_details", "route", "route_name", "driver", "driver_name",
            "shift_type", "departure_time", "expected_arrival_time", "operating_days", "is_active",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_roll = serializers.CharField(source="student.student_profile.roll_number", read_only=True, default="")
    bus_number = serializers.CharField(source="bus.bus_number", read_only=True)
    stop_name = serializers.CharField(source="stop.name", read_only=True, default="")

    class Meta:
        model = Attendance
        fields = [
            "id", "student", "student_name", "student_roll", "bus", "bus_number",
            "stop", "stop_name", "date", "boarded_at", "status", "qr_hash_token",
        ]
        read_only_fields = ["id", "boarded_at", "date"]


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    bus_number = serializers.CharField(source="bus.bus_number", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "student", "student_name", "bus", "bus_number", "route",
            "seat_number", "booking_date", "status", "booked_at",
        ]
        read_only_fields = ["id", "booked_at"]


class WaitlistSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)

    class Meta:
        model = Waitlist
        fields = ["id", "student", "student_name", "bus", "priority_score", "created_at", "is_allocated"]
        read_only_fields = ["id", "created_at"]


class FeedbackSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id", "student", "student_name", "bus", "route", "rating", "category",
            "comment", "sentiment_score", "sentiment_label", "created_at",
        ]
        read_only_fields = ["id", "sentiment_score", "sentiment_label", "created_at", "student"]


# ─── Specialized Request Serializers ───

class QRScanRequestSerializer(serializers.Serializer):
    qr_token = serializers.CharField(required=True)
    bus_id = serializers.IntegerField(required=True)
    stop_id = serializers.IntegerField(required=False, allow_null=True)


class SeatReservationRequestSerializer(serializers.Serializer):
    bus_id = serializers.IntegerField(required=True)
    route_id = serializers.IntegerField(required=True)
    booking_date = serializers.DateField(required=True)
    preferred_seat = serializers.IntegerField(required=False, allow_null=True)


class RouteOptimizeRequestSerializer(serializers.Serializer):
    start_stop_id = serializers.IntegerField(required=True)
    goal_stop_id = serializers.IntegerField(required=True)


class AutocompleteRequestSerializer(serializers.Serializer):
    query = serializers.CharField(required=True, min_length=1)
    limit = serializers.IntegerField(default=5, min_value=1, max_value=20)
