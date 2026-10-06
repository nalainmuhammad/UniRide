"""
UniRide CTMS v2.0 — Django Settings
Enterprise-grade configuration with environment variable support.
"""

import os
from pathlib import Path
from datetime import timedelta

import environ
import dj_database_url

# ─── Base Directory ───
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Environment Variables ───
env = environ.Env(
    DEBUG=(bool, True),
    ENVIRONMENT=(str, "development"),
)
environ.Env.read_env(os.path.join(BASE_DIR.parent, ".env"), overrides=False)

# ─── Security ───
SECRET_KEY = env("SECRET_KEY", default="django-insecure-dev-local-secret-key-uniride-2026")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "0.0.0.0"])

# ─── Application Registry ───
INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
    "drf_spectacular",
    # UniRide Apps
    "core.apps.CoreConfig",
    "transit.apps.TransitConfig",
    "telemetry.apps.TelemetryConfig",
    "ids_analytics.apps.IdsAnalyticsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "uniride.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "uniride.wsgi.application"
ASGI_APPLICATION = "uniride.asgi.application"

# ─── Database (PostgreSQL 16 via Supabase / Docker) ───
DATABASE_URL = env("DATABASE_URL", default="postgresql://postgres:postgres@localhost:5432/uniride_db")

DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600),
}

# ─── Custom User Model ───
AUTH_USER_MODEL = "core.User"

# ─── Password Validation ───
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalization ───
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Karachi"
USE_I18N = True
USE_TZ = True

# ─── Static Files ───
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Django REST Framework ───
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "300/minute",
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "core.exceptions.rfc7807_exception_handler",
}

# ─── JWT Configuration ───
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(env("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default="60"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(env("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default="14"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "TOKEN_OBTAIN_SERIALIZER": "core.serializers.CustomTokenObtainPairSerializer",
}

# ─── CORS ───
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)
CORS_ALLOW_CREDENTIALS = True

# ─── Redis & Django Channels ───
REDIS_URL = env("REDIS_URL", default="")

if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [REDIS_URL],
            },
        },
    }
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
            "TIMEOUT": 300,
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    }
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "uniride-local-mem",
            "TIMEOUT": 300,
        },
    }

# ─── C# DSA Microservice Connection ───
DSA_SERVICE_URL = env("DSA_SERVICE_URL", default="http://localhost:5050")
DSA_INTERNAL_API_KEY = env("DSA_INTERNAL_API_KEY", default="uniride-dsa-internal-secret-token-2026")

# ─── OpenAPI / Swagger ───
SPECTACULAR_SETTINGS = {
    "TITLE": "UniRide CTMS v2.0 API",
    "DESCRIPTION": "Campus Transport Management System — REST & Real-Time API",
    "VERSION": "2.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ─── Security Headers (Production) ───
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# ─── Logging ───
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"uniride-backend","message":"%(message)s","module":"%(name)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "core": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
        "transit": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
        "telemetry": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
    },
}
