"""
UniRide CTMS v2.0 — Transit URL Configuration
Exposes routes under /api/v1/transit/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("stops", views.StopViewSet, basename="stops")
router.register("routes", views.RouteViewSet, basename="routes")
router.register("buses", views.BusViewSet, basename="buses")
router.register("schedules", views.ScheduleViewSet, basename="schedules")
router.register("bookings", views.BookingViewSet, basename="bookings")
router.register("feedbacks", views.FeedbackViewSet, basename="feedbacks")

urlpatterns = [
    # ─── Specialized Algorithmic Endpoints (MUST come before router) ───
    path("attendance/check-in/", views.verify_and_checkin_attendance, name="attendance-checkin"),
    path("seats/reserve/", views.reserve_seat_avl, name="seat-reserve"),
    path("nearest-stops/", views.nearest_stops_kdtree, name="stop-nearest"),
    path("stops/nearest/", views.nearest_stops_kdtree, name="stops-nearest-alias"),
    path("autocomplete-stops/", views.autocomplete_stops_trie, name="stop-autocomplete"),
    path("stops/autocomplete/", views.autocomplete_stops_trie, name="stops-autocomplete-alias"),
    path("optimize-route/", views.optimize_route_graph, name="route-optimize"),
    path("routes/optimize/", views.optimize_route_graph, name="routes-optimize-alias"),

    # ─── DRF Router (CRUD ViewSets) ───
    path("", include(router.urls)),
]
