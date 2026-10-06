"""
UniRide CTMS v2.0 — Transit Models
Comprehensive relational transit models porting legacy ASP.NET entities:
Bus, Route, Stop, RouteStop, Schedule, Attendance, Booking, Waitlist, Feedback.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Bus(models.Model):
    """
    Fleet vehicle representation ported from legacy Bus.cs.
    Tracks real-time GPS telemetry, seating capacity, and mechanical status.
    """

    class Status(models.TextChoices):
        INACTIVE = "INACTIVE", "Inactive"
        EN_ROUTE = "EN_ROUTE", "En Route"
        DELAYED = "DELAYED", "Delayed"
        MAINTENANCE = "MAINTENANCE", "In Maintenance"

    bus_number = models.CharField(max_length=50, unique=True)
    registration_plate = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField(default=50)
    current_occupancy = models.PositiveIntegerField(default=0)
    model_name = models.CharField(max_length=100, default="Coaster Hino 2024")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.INACTIVE)
    
    # Real-time Telemetry
    current_latitude = models.FloatField(default=33.6844)  # Islamabad/Rawalpindi default
    current_longitude = models.FloatField(default=73.0479)
    current_speed = models.FloatField(default=0.0)  # km/h
    last_telemetry_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "buses"
        ordering = ["bus_number"]
        verbose_name_plural = "Buses"

    def __str__(self) -> str:
        return f"Bus {self.bus_number} [{self.status}] ({self.current_occupancy}/{self.capacity} seats)"

    @property
    def available_seats(self) -> int:
        return max(0, self.capacity - self.current_occupancy)


class Stop(models.Model):
    """
    Geospatial pickup/drop-off stop point.
    """
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "stops"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class Route(models.Model):
    """
    Fleet transit route connecting terminal stops across the campus and city.
    Ported from legacy BusRoute.cs.
    """
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    total_distance_km = models.FloatField(default=0.0)
    estimated_duration_min = models.PositiveIntegerField(default=45)
    polyline_coordinates = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "routes"
        ordering = ["code"]

    def __str__(self) -> str:
        return f"{self.code} — {self.name} ({self.origin} ➔ {self.destination})"


class RouteStop(models.Model):
    """
    Ordered sequence of stops defining a route.
    """
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="route_stops")
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="route_stops")
    sequence_order = models.PositiveIntegerField()
    distance_from_start_km = models.FloatField(default=0.0)
    estimated_minutes_from_start = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "route_stops"
        ordering = ["route", "sequence_order"]
        unique_together = [("route", "sequence_order"), ("route", "stop")]

    def __str__(self) -> str:
        return f"{self.route.code} Stop #{self.sequence_order}: {self.stop.name}"


class Schedule(models.Model):
    """
    Shift and timetable assigning driver and bus to a specific route.
    Ported from legacy Schedule.cs.
    """
    class ShiftType(models.TextChoices):
        MORNING = "MORNING", "Morning (07:00 - 09:00)"
        AFTERNOON = "AFTERNOON", "Afternoon (13:00 - 15:00)"
        EVENING = "EVENING", "Evening (17:00 - 19:00)"
        SPECIAL = "SPECIAL", "Special Event"

    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name="schedules")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="schedules")
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_schedules")
    shift_type = models.CharField(max_length=15, choices=ShiftType.choices, default=ShiftType.MORNING)
    departure_time = models.TimeField()
    expected_arrival_time = models.TimeField()
    operating_days = models.CharField(max_length=50, default="Mon,Tue,Wed,Thu,Fri")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "schedules"
        ordering = ["departure_time"]

    def __str__(self) -> str:
        return f"[{self.shift_type}] {self.route.code} - Bus {self.bus.bus_number} (Dep: {self.departure_time})"


class Attendance(models.Model):
    """
    Boarding attendance record ported from legacy Attendance.cs.
    Verified via TOTP QR Code / RFID with Counting Bloom Filter pre-check.
    """
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        LATE = "LATE", "Late Boarding"
        CANCELLED = "CANCELLED", "Cancelled"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendances")
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name="attendances")
    stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, related_name="attendances")
    date = models.DateField(auto_now_add=True)
    boarded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PRESENT)
    qr_hash_token = models.CharField(max_length=128, blank=True)
    verified_by_driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="inspected_attendances"
    )

    class Meta:
        db_table = "attendances"
        ordering = ["-boarded_at"]

    def __str__(self) -> str:
        return f"{self.date} — {self.student.get_full_name()} on Bus {self.bus.bus_number}"


class Booking(models.Model):
    """
    Seat reservation for students, managed via C# AVL Tree seat allocator.
    """
    class Status(models.TextChoices):
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seat_bookings")
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name="seat_bookings")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="seat_bookings")
    seat_number = models.PositiveIntegerField()
    booking_date = models.DateField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.CONFIRMED)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "seat_bookings"
        unique_together = [("bus", "seat_number", "booking_date")]
        ordering = ["-booking_date", "seat_number"]

    def __str__(self) -> str:
        return f"Seat {self.seat_number} on Bus {self.bus.bus_number} for {self.student.get_full_name()} ({self.booking_date})"


class Waitlist(models.Model):
    """
    Priority waitlist for over-subscribed bus routes.
    Managed via C# Max-Heap priority queue.
    """
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="waitlists")
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name="waitlists")
    priority_score = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_allocated = models.BooleanField(default=False)

    class Meta:
        db_table = "waitlists"
        ordering = ["-priority_score", "created_at"]

    def __str__(self) -> str:
        return f"Waitlist {self.student.get_full_name()} for Bus {self.bus.bus_number} (Score: {self.priority_score})"


class Feedback(models.Model):
    """
    Student trip feedback ported from legacy Feedback.cs.
    Enriched with real-time NLP sentiment scoring (IDS Feature Option C).
    """
    class Category(models.TextChoices):
        PUNCTUALITY = "PUNCTUALITY", "Punctuality & Timing"
        DRIVING = "DRIVING", "Driver Safety & Behavior"
        COMFORT = "COMFORT", "Vehicle Comfort & AC"
        CROWDING = "CROWDING", "Overcrowding & Seating"
        OTHER = "OTHER", "Other"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trip_feedbacks")
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name="feedbacks")
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name="feedbacks")
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    comment = models.TextField(blank=True)
    
    # NLP Sentiment Pipeline Fields
    sentiment_score = models.FloatField(default=0.0)  # -1.0 (very negative) to +1.0 (very positive)
    sentiment_label = models.CharField(max_length=15, default="NEUTRAL")  # POSITIVE, NEUTRAL, NEGATIVE
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "trip_feedbacks"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.rating}★ [{self.sentiment_label}] by {self.student.get_full_name()}"
