"""
UniRide CTMS v2.0 — Transit App Unit Tests
Validates transit models, fleet ViewSets, seat reservation logic,
attendance check-in, and algorithmic endpoint integration.
"""

from datetime import date, time, timedelta
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from .models import Bus, Route, Stop, RouteStop, Schedule, Attendance, Booking, Waitlist, Feedback

User = get_user_model()


class BusModelTests(TestCase):
    """Validates Bus model and computed properties."""

    def test_create_bus(self):
        bus = Bus.objects.create(
            bus_number="TEST-01", registration_plate="TST-001",
            capacity=50, current_occupancy=30
        )
        self.assertEqual(bus.available_seats, 20)
        self.assertEqual(bus.status, Bus.Status.INACTIVE)
        self.assertIn("TEST-01", str(bus))

    def test_available_seats_at_capacity(self):
        bus = Bus.objects.create(
            bus_number="FULL-01", registration_plate="FUL-001",
            capacity=50, current_occupancy=50
        )
        self.assertEqual(bus.available_seats, 0)

    def test_available_seats_over_capacity(self):
        bus = Bus.objects.create(
            bus_number="OVER-01", registration_plate="OVR-001",
            capacity=50, current_occupancy=55
        )
        self.assertEqual(bus.available_seats, 0)  # max(0, -5) = 0


class StopModelTests(TestCase):
    """Validates Stop model."""

    def test_create_stop(self):
        stop = Stop.objects.create(
            name="Test Stop", code="TS-01",
            latitude=33.6844, longitude=73.0479
        )
        self.assertTrue(stop.is_active)
        self.assertIn("TS-01", str(stop))


class RouteModelTests(TestCase):
    """Validates Route model with RouteStop ordering."""

    def test_create_route_with_stops(self):
        route = Route.objects.create(
            name="Test Route", code="TR-01",
            origin="Start", destination="End",
            total_distance_km=10.5, estimated_duration_min=25
        )
        stop1 = Stop.objects.create(name="First", code="F1", latitude=33.60, longitude=73.00)
        stop2 = Stop.objects.create(name="Last", code="L1", latitude=33.65, longitude=73.01)

        RouteStop.objects.create(route=route, stop=stop1, sequence_order=1, distance_from_start_km=0.0)
        RouteStop.objects.create(route=route, stop=stop2, sequence_order=2, distance_from_start_km=10.5)

        self.assertEqual(route.route_stops.count(), 2)
        first_rs = route.route_stops.first()
        self.assertEqual(first_rs.sequence_order, 1)


class BookingModelTests(TestCase):
    """Validates seat booking unique constraints."""

    def setUp(self):
        self.student = User.objects.create_user(username="book_student", password="TestPass123", role=User.Role.STUDENT)
        self.bus = Bus.objects.create(bus_number="BK-01", registration_plate="BK-001", capacity=50)
        self.route = Route.objects.create(name="Booking Route", code="BR-01", origin="A", destination="B")

    def test_create_booking(self):
        booking = Booking.objects.create(
            student=self.student, bus=self.bus, route=self.route,
            seat_number=5, booking_date=date.today()
        )
        self.assertEqual(booking.status, Booking.Status.CONFIRMED)
        self.assertIn("Seat 5", str(booking))

    def test_duplicate_seat_blocked(self):
        Booking.objects.create(
            student=self.student, bus=self.bus, route=self.route,
            seat_number=10, booking_date=date.today()
        )
        student2 = User.objects.create_user(username="book_student2", password="TestPass123", role=User.Role.STUDENT)
        with self.assertRaises(Exception):
            Booking.objects.create(
                student=student2, bus=self.bus, route=self.route,
                seat_number=10, booking_date=date.today()
            )


class FeedbackModelTests(TestCase):
    """Validates Feedback with NLP sentiment fields."""

    def test_create_feedback_with_sentiment(self):
        student = User.objects.create_user(username="fb_student", password="TestPass123", role=User.Role.STUDENT)
        bus = Bus.objects.create(bus_number="FB-01", registration_plate="FB-001", capacity=50)
        fb = Feedback.objects.create(
            student=student, bus=bus, rating=4,
            category=Feedback.Category.PUNCTUALITY,
            comment="Very good timing today",
            sentiment_score=0.72, sentiment_label="POSITIVE"
        )
        self.assertEqual(fb.sentiment_label, "POSITIVE")
        self.assertIn("POSITIVE", str(fb))
        self.assertIn("4★", str(fb))


@override_settings(
    DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    CHANNEL_LAYERS={"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}},
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}},
)
class TransitAPITests(APITestCase):
    """Integration tests for transit REST API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username="api_admin", password="Admin@123", role=User.Role.ADMIN
        )
        self.student = User.objects.create_user(
            username="api_student", password="Student@123",
            first_name="API", last_name="Student", role=User.Role.STUDENT
        )
        self.bus = Bus.objects.create(
            bus_number="API-01", registration_plate="API-001",
            capacity=50, current_occupancy=10, status=Bus.Status.EN_ROUTE
        )
        self.route = Route.objects.create(
            name="API Route", code="AR-01",
            origin="Start", destination="End"
        )
        self.stop = Stop.objects.create(
            name="API Stop", code="AS-01",
            latitude=33.68, longitude=73.05
        )

    def test_list_buses(self):
        response = self.client.get("/api/v1/transit/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_routes(self):
        response = self.client.get("/api/v1/transit/routes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_stops(self):
        response = self.client.get("/api/v1/transit/stops/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_seat_reservation_endpoint(self):
        self.client.force_authenticate(user=self.student)
        data = {
            "bus_id": self.bus.id,
            "route_id": self.route.id,
            "booking_date": str(date.today()),
        }
        response = self.client.post("/api/v1/transit/seats/reserve/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "CONFIRMED")
        self.assertIn("seat_number", response.data["booking"])

    def test_seat_reservation_waitlist_full_bus(self):
        self.bus.current_occupancy = 50
        self.bus.save()
        # Fill all seats
        for i in range(1, 51):
            User.objects.create_user(username=f"fill_{i}", password="TestPass123", role=User.Role.STUDENT)
        for i in range(1, 51):
            user = User.objects.get(username=f"fill_{i}")
            Booking.objects.create(
                student=user, bus=self.bus, route=self.route,
                seat_number=i, booking_date=date.today()
            )

        self.client.force_authenticate(user=self.student)
        data = {
            "bus_id": self.bus.id,
            "route_id": self.route.id,
            "booking_date": str(date.today()),
        }
        response = self.client.post("/api/v1/transit/seats/reserve/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "WAITLISTED")

    def test_feedback_submission_with_sentiment(self):
        self.client.force_authenticate(user=self.student)
        data = {
            "bus": self.bus.id,
            "route": self.route.id,
            "rating": 5,
            "category": "PUNCTUALITY",
            "comment": "Great and excellent on time service!",
        }
        response = self.client.post("/api/v1/transit/feedbacks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["sentiment_label"], "POSITIVE")

    def test_nearest_stops_endpoint(self):
        response = self.client.get("/api/v1/transit/nearest-stops/?lat=33.68&lng=73.05&k=2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_autocomplete_stops_endpoint(self):
        response = self.client.get("/api/v1/transit/autocomplete-stops/?q=API")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
