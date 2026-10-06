"""
UniRide CTMS v2.0 — Seed Data Command
Populates database with realistic campus stops, routes, buses, drivers,
sample students, schedules, and active passes.
"""

from datetime import date, time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import StudentProfile, DriverProfile, Notification
from transit.models import Bus, Route, Stop, RouteStop, Schedule, Attendance, Feedback

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with initial campus transit data, fleet assets, and users"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[SEED] Starting UniRide CTMS v2.0 database seeding..."))

        # 1. Admin User
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@uniride.edu.pk",
                "first_name": "Fleet",
                "last_name": "Administrator",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("Admin@123")
        admin_user.save()
        self.stdout.write(self.style.SUCCESS("[OK] Admin user created: admin / Admin@123"))

        # 2. Drivers
        driver1, _ = User.objects.get_or_create(
            username="driver_tariq",
            defaults={
                "email": "tariq@uniride.edu.pk",
                "first_name": "Tariq",
                "last_name": "Mehmood",
                "role": User.Role.DRIVER,
                "phone": "+92 300 1234567",
            },
        )
        driver1.set_password("Driver@123")
        driver1.save()
        DriverProfile.objects.get_or_create(user=driver1, defaults={"license_number": "ISB-DL-98211", "experience_years": 8, "rating_score": 4.9})

        driver2, _ = User.objects.get_or_create(
            username="driver_aslam",
            defaults={
                "email": "aslam@uniride.edu.pk",
                "first_name": "Muhammad",
                "last_name": "Aslam",
                "role": User.Role.DRIVER,
                "phone": "+92 301 7654321",
            },
        )
        driver2.set_password("Driver@123")
        driver2.save()
        DriverProfile.objects.get_or_create(user=driver2, defaults={"license_number": "RWP-DL-44319", "experience_years": 12, "rating_score": 4.7})
        self.stdout.write(self.style.SUCCESS("[OK] Drivers created: driver_tariq, driver_aslam (password: Driver@123)"))

        # 3. Students
        student1, _ = User.objects.get_or_create(
            username="student_bilal",
            defaults={
                "email": "bilal.khan@nu.edu.pk",
                "first_name": "Bilal",
                "last_name": "Khan",
                "role": User.Role.STUDENT,
                "phone": "+92 333 5551234",
            },
        )
        student1.set_password("Student@123")
        student1.save()
        s1_profile, _ = StudentProfile.objects.get_or_create(
            user=student1,
            defaults={"roll_number": "FA23-BCS-001", "rfid_card_uid": "A1B2C3D4", "emergency_contact": "+92 300 9998877", "address": "Saddar, Rawalpindi"}
        )

        student2, _ = User.objects.get_or_create(
            username="student_ayesha",
            defaults={
                "email": "ayesha.malik@nu.edu.pk",
                "first_name": "Ayesha",
                "last_name": "Malik",
                "role": User.Role.STUDENT,
                "phone": "+92 334 6667890",
            },
        )
        student2.set_password("Student@123")
        student2.save()
        s2_profile, _ = StudentProfile.objects.get_or_create(
            user=student2,
            defaults={"roll_number": "FA23-BSE-042", "rfid_card_uid": "E5F6A7B8", "emergency_contact": "+92 301 8887766", "address": "F-10 Markaz, Islamabad"}
        )
        self.stdout.write(self.style.SUCCESS("[OK] Students created: student_bilal, student_ayesha (password: Student@123)"))

        # 4. Stops
        stops_data = [
            {"name": "FAST-NUCES Campus Terminal", "code": "ST-01", "latitude": 33.6555, "longitude": 73.0153, "address": "AK Brohi Road, H-11/4, Islamabad"},
            {"name": "Faizabad Interchange Terminal", "code": "ST-02", "latitude": 33.6631, "longitude": 73.0848, "address": "Faizabad, Islamabad-Rawalpindi Border"},
            {"name": "Zero Point Interchange", "code": "ST-03", "latitude": 33.6934, "longitude": 73.0645, "address": "Kashmir Highway, Zero Point"},
            {"name": "Saddar Metro Station", "code": "ST-04", "latitude": 33.5989, "longitude": 73.0531, "address": "Mall Road, Saddar, Rawalpindi"},
            {"name": "Blue Area - Stock Exchange", "code": "ST-05", "latitude": 33.7118, "longitude": 73.0617, "address": "Jinnah Avenue, Blue Area, Islamabad"},
            {"name": "F-10 Markaz Roundabout", "code": "ST-06", "latitude": 33.6961, "longitude": 73.0112, "address": "F-10 Markaz, Islamabad"},
            {"name": "I-8 Markaz Commercial", "code": "ST-07", "latitude": 33.6685, "longitude": 73.0762, "address": "I-8 Markaz, Islamabad"},
            {"name": "G-11 Markaz Main Stop", "code": "ST-08", "latitude": 33.6698, "longitude": 72.9982, "address": "G-11 Markaz, Islamabad"},
        ]
        created_stops = {}
        for s_data in stops_data:
            stop_obj, _ = Stop.objects.get_or_create(code=s_data["code"], defaults=s_data)
            created_stops[s_data["code"]] = stop_obj
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(created_stops)} Stops verified"))

        # 5. Routes
        r1, _ = Route.objects.get_or_create(
            code="R-101",
            defaults={
                "name": "Rawalpindi Express (Saddar -> FAST Campus)",
                "origin": "Saddar Metro Station",
                "destination": "FAST-NUCES Campus Terminal",
                "total_distance_km": 16.5,
                "estimated_duration_min": 40,
                "polyline_coordinates": [
                    [33.5989, 73.0531],
                    [33.6631, 73.0848],
                    [33.6934, 73.0645],
                    [33.6555, 73.0153],
                ],
            },
        )
        r2, _ = Route.objects.get_or_create(
            code="R-202",
            defaults={
                "name": "Islamabad Capital Loop (G-11 -> FAST Campus)",
                "origin": "G-11 Markaz Main Stop",
                "destination": "FAST-NUCES Campus Terminal",
                "total_distance_km": 14.2,
                "estimated_duration_min": 35,
                "polyline_coordinates": [
                    [33.6698, 72.9982],
                    [33.6961, 73.0112],
                    [33.7118, 73.0617],
                    [33.6685, 73.0762],
                    [33.6555, 73.0153],
                ],
            },
        )

        # Route Stops
        RouteStop.objects.get_or_create(route=r1, stop=created_stops["ST-04"], defaults={"sequence_order": 1, "distance_from_start_km": 0.0, "estimated_minutes_from_start": 0})
        RouteStop.objects.get_or_create(route=r1, stop=created_stops["ST-02"], defaults={"sequence_order": 2, "distance_from_start_km": 8.2, "estimated_minutes_from_start": 18})
        RouteStop.objects.get_or_create(route=r1, stop=created_stops["ST-03"], defaults={"sequence_order": 3, "distance_from_start_km": 12.1, "estimated_minutes_from_start": 28})
        RouteStop.objects.get_or_create(route=r1, stop=created_stops["ST-01"], defaults={"sequence_order": 4, "distance_from_start_km": 16.5, "estimated_minutes_from_start": 40})

        RouteStop.objects.get_or_create(route=r2, stop=created_stops["ST-08"], defaults={"sequence_order": 1, "distance_from_start_km": 0.0, "estimated_minutes_from_start": 0})
        RouteStop.objects.get_or_create(route=r2, stop=created_stops["ST-06"], defaults={"sequence_order": 2, "distance_from_start_km": 3.8, "estimated_minutes_from_start": 10})
        RouteStop.objects.get_or_create(route=r2, stop=created_stops["ST-05"], defaults={"sequence_order": 3, "distance_from_start_km": 7.4, "estimated_minutes_from_start": 20})
        RouteStop.objects.get_or_create(route=r2, stop=created_stops["ST-07"], defaults={"sequence_order": 4, "distance_from_start_km": 11.2, "estimated_minutes_from_start": 27})
        RouteStop.objects.get_or_create(route=r2, stop=created_stops["ST-01"], defaults={"sequence_order": 5, "distance_from_start_km": 14.2, "estimated_minutes_from_start": 35})
        self.stdout.write(self.style.SUCCESS("[OK] Routes and RouteStop sequences configured"))

        # 6. Fleet Buses
        bus1, _ = Bus.objects.get_or_create(
            bus_number="BUS-01",
            defaults={"registration_plate": "ICT-101", "capacity": 50, "current_occupancy": 32, "model_name": "Coaster Hino 2024", "status": Bus.Status.EN_ROUTE, "current_latitude": 33.6631, "current_longitude": 73.0848, "current_speed": 42.5}
        )
        bus2, _ = Bus.objects.get_or_create(
            bus_number="BUS-02",
            defaults={"registration_plate": "ICT-102", "capacity": 50, "current_occupancy": 48, "model_name": "Toyota Coaster Deluxe", "status": Bus.Status.EN_ROUTE, "current_latitude": 33.6961, "current_longitude": 73.0112, "current_speed": 38.0}
        )
        bus3, _ = Bus.objects.get_or_create(
            bus_number="BUS-03",
            defaults={"registration_plate": "ICT-103", "capacity": 60, "current_occupancy": 15, "model_name": "Isuzu King Long 2023", "status": Bus.Status.INACTIVE, "current_latitude": 33.6555, "current_longitude": 73.0153, "current_speed": 0.0}
        )
        bus4, _ = Bus.objects.get_or_create(
            bus_number="BUS-04",
            defaults={"registration_plate": "ICT-104", "capacity": 45, "current_occupancy": 0, "model_name": "Mitsubishi Rosa", "status": Bus.Status.MAINTENANCE, "current_latitude": 33.6555, "current_longitude": 73.0153, "current_speed": 0.0}
        )
        self.stdout.write(self.style.SUCCESS("[OK] 4 Fleet Buses provisioned"))

        # 7. Schedules
        Schedule.objects.get_or_create(
            bus=bus1, route=r1, driver=driver1, shift_type=Schedule.ShiftType.MORNING,
            defaults={"departure_time": time(7, 30), "expected_arrival_time": time(8, 15)}
        )
        Schedule.objects.get_or_create(
            bus=bus2, route=r2, driver=driver2, shift_type=Schedule.ShiftType.MORNING,
            defaults={"departure_time": time(7, 40), "expected_arrival_time": time(8, 20)}
        )
        Schedule.objects.get_or_create(
            bus=bus1, route=r1, driver=driver1, shift_type=Schedule.ShiftType.AFTERNOON,
            defaults={"departure_time": time(14, 0), "expected_arrival_time": time(14, 45)}
        )
        self.stdout.write(self.style.SUCCESS("[OK] Daily shifts and timetables scheduled"))

        # 8. Notifications
        Notification.objects.get_or_create(
            title="Campus Fleet Service Resumed",
            defaults={"message": "All morning and afternoon transit shuttles are operating on normal schedule.", "target_role": "ALL", "is_emergency_broadcast": False}
        )
        Notification.objects.get_or_create(
            title="Route R-101 Construction Alert",
            defaults={"message": "Expect 10-minute delays near Faizabad flyover due to CDA carpet resurfacing work.", "target_role": "ALL", "is_emergency_broadcast": False}
        )

        # 9. Feedbacks
        Feedback.objects.get_or_create(
            student=student1, bus=bus1, route=r1,
            defaults={"rating": 5, "category": Feedback.Category.PUNCTUALITY, "comment": "Bus was exactly on time at Saddar metro. AC working great!", "sentiment_score": 0.85, "sentiment_label": "POSITIVE"}
        )
        Feedback.objects.get_or_create(
            student=student2, bus=bus2, route=r2,
            defaults={"rating": 3, "category": Feedback.Category.CROWDING, "comment": "A bit crowded near Blue area stop, almost out of seats.", "sentiment_score": -0.2, "sentiment_label": "NEGATIVE"}
        )

        self.stdout.write(self.style.SUCCESS("[SUCCESS] Seeding successfully completed!"))
