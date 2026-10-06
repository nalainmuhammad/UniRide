"""
UniRide CTMS v2.0 — Telemetry & WebSocket Consumers (CN Feature Option B)
High-throughput bidirectional real-time communication via Django Channels & Redis.
"""

import json
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

logger = logging.getLogger("uniride.telemetry")


class BusTrackingConsumer(AsyncWebsocketConsumer):
    """
    Subscribed by commuter web apps to receive live bus coordinates on a specific route.
    Also handles RTT latency ping-pong measurement.
    """

    async def connect(self):
        self.route_id = self.scope["url_route"]["kwargs"].get("route_id", "all")
        self.group_name = f"fleet_route_{self.route_id}"

        # Join Route Group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send handshake ACK with RFC 6455 timestamp
        await self.send(text_data=json.dumps({
            "type": "handshake_ack",
            "protocol": "RFC 6455",
            "route_id": self.route_id,
            "connected_at": time.time(),
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        """Handle client ping to measure network RTT latency."""
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get("type")
        if msg_type == "ping":
            # Echo back pong with high-precision server timestamp
            client_ts = data.get("client_timestamp", time.time())
            server_ts = time.time()
            await self.send(text_data=json.dumps({
                "type": "pong",
                "client_timestamp": client_ts,
                "server_timestamp": server_ts,
                "server_processing_time_ms": round((time.time() - server_ts) * 1000, 3),
            }))

    async def fleet_location_update(self, event):
        """Receive broadcast from Channel Layer and push to commuter client."""
        await self.send(text_data=json.dumps({
            "type": "bus_location",
            "bus_id": event["bus_id"],
            "latitude": event["latitude"],
            "longitude": event["longitude"],
            "speed": event["speed"],
            "timestamp": event["timestamp"],
        }))


class DriverTelemetryConsumer(AsyncWebsocketConsumer):
    """
    Driver HUD transmits continuous high-frequency GPS coordinate packets.
    Updates database Bus state and broadcasts to active commuter subscribers.
    """

    async def connect(self):
        self.user = self.scope.get("user")
        self.group_name = "driver_telemetry_hub"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "driver_session_ready",
            "driver_name": getattr(self.user, "get_full_name", lambda: "Driver")(),
            "timestamp": time.time(),
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        bus_id = data.get("bus_id")
        route_id = data.get("route_id")
        lat = data.get("latitude")
        lng = data.get("longitude")
        speed = data.get("speed", 0.0)

        if bus_id and lat is not None and lng is not None:
            # Asynchronously update database
            await self.save_bus_telemetry(bus_id, lat, lng, speed)

            # Broadcast to route group and global fleet group
            broadcast_event = {
                "type": "fleet_location_update",
                "bus_id": bus_id,
                "latitude": lat,
                "longitude": lng,
                "speed": speed,
                "timestamp": timezone.now().isoformat(),
            }

            if route_id:
                await self.channel_layer.group_send(f"fleet_route_{route_id}", broadcast_event)
            await self.channel_layer.group_send("fleet_route_all", broadcast_event)

    @database_sync_to_async
    def save_bus_telemetry(self, bus_id: int, lat: float, lng: float, speed: float) -> None:
        from transit.models import Bus
        Bus.objects.filter(id=bus_id).update(
            current_latitude=lat,
            current_longitude=lng,
            current_speed=speed,
            status=Bus.Status.EN_ROUTE,
            last_telemetry_at=timezone.now(),
        )


class NotificationConsumer(AsyncWebsocketConsumer):
    """Real-time push notifications and emergency SOS alerts."""

    async def connect(self):
        self.user = self.scope.get("user")
        self.role = getattr(self.user, "role", "STUDENT")

        self.groups_to_join = ["notifications_all", f"notifications_{self.role}"]
        for group in self.groups_to_join:
            await self.channel_layer.group_add(group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for group in self.groups_to_join:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def system_notification(self, event):
        """Receive broadcast from Channel Layer and send to client."""
        await self.send(text_data=json.dumps({
            "type": "notification",
            "title": event["title"],
            "message": event["message"],
            "is_emergency": event.get("is_emergency", False),
            "created_at": event.get("created_at", timezone.now().isoformat()),
        }))
