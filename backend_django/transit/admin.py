"""
UniRide CTMS v2.0 — Transit Admin Configuration
Fleet management admin panels for Bus, Route, Stop, Schedule, Attendance,
Booking, Waitlist, and Feedback models.
"""

from django.contrib import admin

from .models import Bus, Route, Stop, RouteStop, Schedule, Attendance, Booking, Waitlist, Feedback


class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 1
    ordering = ["sequence_order"]


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ["bus_number", "registration_plate", "capacity", "current_occupancy", "status", "is_active"]
    list_filter = ["status", "is_active"]
    search_fields = ["bus_number", "registration_plate"]


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "latitude", "longitude", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "code"]


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "origin", "destination", "total_distance_km", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "code"]
    inlines = [RouteStopInline]


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ["bus", "route", "driver", "shift_type", "departure_time", "is_active"]
    list_filter = ["shift_type", "is_active"]
    raw_id_fields = ["bus", "route", "driver"]


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["student", "bus", "stop", "date", "status", "boarded_at"]
    list_filter = ["status", "date"]
    raw_id_fields = ["student", "bus", "stop", "verified_by_driver"]
    date_hierarchy = "date"


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["student", "bus", "route", "seat_number", "booking_date", "status"]
    list_filter = ["status", "booking_date"]
    raw_id_fields = ["student", "bus", "route"]
    date_hierarchy = "booking_date"


@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ["student", "bus", "priority_score", "is_allocated", "created_at"]
    list_filter = ["is_allocated"]
    raw_id_fields = ["student", "bus"]


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["student", "bus", "route", "rating", "category", "sentiment_label", "created_at"]
    list_filter = ["category", "sentiment_label", "rating"]
    search_fields = ["comment"]
    raw_id_fields = ["student", "bus", "route"]
