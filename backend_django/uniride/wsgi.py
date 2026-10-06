"""
UniRide CTMS v2.0 — WSGI Configuration (Fallback for non-async deployments)
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "uniride.settings")
application = get_wsgi_application()
