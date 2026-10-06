"""
UniRide CTMS v2.0 — WebSocket URL Routing
Routes WebSocket connections to Django Channels consumers.
"""

from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^ws/telemetry/route/(?P<route_id>\w+)/$", consumers.BusTrackingConsumer.as_asgi()),
    path("ws/telemetry/driver/", consumers.DriverTelemetryConsumer.as_asgi()),
    path("ws/notifications/", consumers.NotificationConsumer.as_asgi()),
]
