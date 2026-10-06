"""
UniRide CTMS v2.0 — Root URL Configuration
All API endpoints are versioned under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin Panel
    path("admin/", admin.site.urls),

    # ─── Versioned REST API ───
    path("api/v1/auth/", include("core.urls")),
    path("api/v1/transit/", include("transit.urls")),
    path("api/v1/telemetry/", include("telemetry.urls")),
    path("api/v1/analytics/", include("ids_analytics.urls")),
    path("api/v1/ids/", include("ids_analytics.urls")),

    # ─── OpenAPI / Swagger ───
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
