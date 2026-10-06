"""
UniRide CTMS v2.0 — Telemetry Views
Exposes REST endpoints for the protocol dissector, network metrics, and HTTP fallback telemetry.
"""

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.rtm import requirement
from transit.models import Bus
from transit.serializers import BusSerializer
from .protocol_dissector import WebSocketFrameDissector, NetworkTelemetryAnalyzer

analyzer = NetworkTelemetryAnalyzer()


@requirement("FR-035", "Custom Protocol Dissector & Packet-Level Traffic Analyzer")
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def dissect_frame_view(request):
    """
    Decodes an RFC 6455 WebSocket frame from raw hex bytes,
    or generates a synthetic live GPS frame for inspection.
    """
    raw_hex = request.data.get("hex_bytes")
    if raw_hex:
        try:
            raw_bytes = bytes.fromhex(raw_hex.replace(" ", "").replace("0x", ""))
        except ValueError:
            return Response({"error": "Invalid hex byte sequence."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Generate synthetic live GPS telemetry frame
        bus_id = int(request.data.get("bus_id", 1))
        lat = float(request.data.get("latitude", 33.6555))
        lng = float(request.data.get("longitude", 73.0153))
        speed = float(request.data.get("speed", 45.2))
        raw_bytes = WebSocketFrameDissector.generate_synthetic_gps_frame(bus_id, lat, lng, speed)

    dissected = WebSocketFrameDissector.dissect_frame(raw_bytes)
    dissected["raw_frame_hex"] = raw_bytes.hex()
    return Response(dissected)


@requirement("FR-036", "Network Latency, Jitter & Throughput Metrics")
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def network_metrics_view(request):
    """Returns RTT, jitter, and transport layer metrics."""
    return Response(analyzer.get_metrics())


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def live_fleet_telemetry_view(request):
    """HTTP polling fallback for active bus positions if WebSockets fail."""
    buses = Bus.objects.filter(is_active=True).values(
        "id", "bus_number", "status", "current_latitude", "current_longitude",
        "current_speed", "current_occupancy", "capacity", "last_telemetry_at"
    )
    return Response({"buses": list(buses)})
