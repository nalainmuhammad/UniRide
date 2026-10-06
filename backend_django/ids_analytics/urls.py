"""
UniRide CTMS v2.0 — IDS Analytics URL Configuration
Exposes routes under /api/v1/analytics/
"""

from django.urls import path
from . import views

urlpatterns = [
    path("demand-forecast/", views.demand_forecast_view, name="analytics-demand-forecast"),
    path("bottlenecks/", views.bottlenecks_view, name="analytics-bottlenecks"),
    path("sentiment/", views.sentiment_analysis_view, name="analytics-sentiment"),
    path("digital-twin/simulate/", views.digital_twin_simulate_view, name="analytics-digital-twin-simulate"),
    path("causal/root-cause/", views.causal_root_cause_view, name="analytics-causal-root-cause"),
    path("dashboard-summary/", views.dashboard_summary_view, name="analytics-dashboard-summary"),
]
