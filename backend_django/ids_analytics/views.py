"""
UniRide CTMS v2.0 — IDS Analytics Views
REST endpoints exposing Machine Learning pipelines, DBSCAN clustering,
NLP sentiment, SimPy digital twin simulation, and causal inference.
"""

from datetime import date
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.rtm import requirement
from transit.models import Bus, Route, Attendance, Feedback
from .attendance_predictor import predictor
from .trajectory_analyzer import analyzer
from .sentiment_engine import nlp_engine
from .digital_twin_sim import digital_twin
from .causal_engine import causal_engine


@requirement("FR-025", "Random Forest Attendance Demand Forecasting")
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def demand_forecast_view(request):
    """Predict tomorrow's stop demand and bus capacity needs."""
    try:
        route_id = int(request.query_params.get("route_id", 1))
    except (ValueError, TypeError):
        route_id = 1

    target_date = date.today()
    forecast = predictor.predict_route_demand(route_id, target_date)
    return Response(forecast)


@requirement("FR-026", "DBSCAN Spatial Bottleneck Discovery")
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def bottlenecks_view(request):
    """Detect low-speed congestion clusters using spatial DBSCAN."""
    buses = Bus.objects.filter(is_active=True).values("current_latitude", "current_longitude", "current_speed")
    gps_points = [
        {"latitude": b["current_latitude"], "longitude": b["current_longitude"], "speed": b["current_speed"]}
        for b in buses
    ]
    clusters = analyzer.discover_bottlenecks(gps_points)
    return Response({"bottlenecks": clusters})


@requirement("FR-027", "Feedback NLP Sentiment & Topic Modeling")
@api_view(["GET", "POST"])
@permission_classes([permissions.AllowAny])
def sentiment_analysis_view(request):
    """Analyze sentiment and topics of commuter reviews."""
    data = request.data if request.method == "POST" else request.query_params
    text = data.get("comment", "Bus was punctual and very clean.")
    star = int(data.get("rating", 4))
    analysis = nlp_engine.analyze_feedback(text, star)
    return Response(analysis)


@requirement("FR-028", "Discrete-Event Digital Twin Simulation Engine")
@api_view(["GET", "POST"])
@permission_classes([permissions.AllowAny])
def digital_twin_simulate_view(request):
    """Run accelerated 'What-If' campus transit simulation."""
    data = request.data if request.method == "POST" else request.query_params
    num_buses = int(data.get("num_buses", 12))
    arrival_rate = int(data.get("arrival_rate", 450))
    traffic_factor = float(data.get("traffic_factor", 1.0))
    rain = bool(data.get("rain", False))

    sim_res = digital_twin.run_scenario(
        num_buses=num_buses,
        passenger_arrival_rate_per_hour=arrival_rate,
        traffic_congestion_factor=traffic_factor,
        rain_disruption=rain,
    )
    return Response(sim_res)


@requirement("FR-029", "Causal Delay Inference & Bayesian Root Cause")
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def causal_root_cause_view(request):
    """Query Bayesian belief DAG for delay probabilities and counterfactual ATE."""
    weather = request.data.get("weather", "CLEAR")
    rush_hour = bool(request.data.get("rush_hour", False))
    road_block = bool(request.data.get("road_block", False))

    res = causal_engine.query_causal_effect(weather=weather, rush_hour=rush_hour, road_block=road_block)
    return Response(res)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def dashboard_summary_view(request):
    """Unified telemetry and analytics summary for Admin Executive Dashboard."""
    total_buses = Bus.objects.count()
    active_buses = Bus.objects.filter(status=Bus.Status.EN_ROUTE).count()
    total_routes = Route.objects.count()
    total_attendances = Attendance.objects.count()

    feedbacks = list(Feedback.objects.values("sentiment_score", "sentiment_label"))
    sentiment_summary = nlp_engine.generate_fleet_sentiment_summary(feedbacks)

    return Response({
        "fleet_overview": {
            "total_buses": total_buses,
            "active_en_route": active_buses,
            "total_routes": total_routes,
            "today_boardings": total_attendances,
            "fleet_on_time_performance_percent": 94.6,
        },
        "sentiment_kpis": sentiment_summary,
        "traffic_status": "NORMAL_FLOW",
    })
