"""
UniRide CTMS v2.0 — RFC 7807 Problem Details Exception Handler
Standardized error responses for all REST API endpoints.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response


def rfc7807_exception_handler(exc, context) -> Response | None:
    """
    Transform Django REST Framework exceptions into RFC 7807 Problem Details format.
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    request = context.get("request")
    path = request.path if request else "unknown"

    # Build RFC 7807 response body
    problem = {
        "type": f"https://uniride.campus/errors/{response.status_code}",
        "title": getattr(exc, "default_detail", "An error occurred"),
        "status": response.status_code,
        "detail": _extract_detail(response.data),
        "instance": path,
    }

    # Include error code if available
    code = getattr(exc, "default_code", None)
    if code:
        problem["code"] = code.upper()

    response.data = problem
    response.content_type = "application/problem+json"
    return response


def _extract_detail(data) -> str:
    """Flatten nested error structures into a readable detail string."""
    if isinstance(data, str):
        return data
    if isinstance(data, list):
        return "; ".join(str(item) for item in data)
    if isinstance(data, dict):
        parts = []
        for key, value in data.items():
            if isinstance(value, list):
                parts.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                parts.append(f"{key}: {value}")
        return "; ".join(parts)
    return str(data)
