"""
UniRide CTMS v2.0 — Telemetry Admin Configuration
Telemetry app has no models (WebSocket-only), so admin is minimal.
"""

from django.contrib import admin

# Telemetry app uses Django Channels consumers only — no database models to register.
