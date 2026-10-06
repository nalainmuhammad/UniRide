"""
UniRide CTMS v2.0 — IDS Analytics Admin Configuration
IDS Analytics uses pure computation engines (no ORM models).
All data comes from transit models and is processed in-memory.
"""

from django.contrib import admin

# IDS Analytics app has no dedicated database models — all analytics are computed
# from transit.models (Bus, Attendance, Feedback) and returned via REST API.
