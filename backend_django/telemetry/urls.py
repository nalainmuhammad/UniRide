"""
UniRide CTMS v2.0 — Telemetry URL Configuration
Exposes routes under /api/v1/telemetry/
"""

from django.urls import path
from . import views

urlpatterns = [
    path("dissect/", views.dissect_frame_view, name="telemetry-dissect"),
    path("metrics/", views.network_metrics_view, name="telemetry-metrics"),
    path("network/metrics/", views.network_metrics_view, name="telemetry-network-metrics"),
    path("live-fleet/", views.live_fleet_telemetry_view, name="telemetry-live-fleet"),
]
