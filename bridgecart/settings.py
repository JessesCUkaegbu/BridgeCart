import os
from pathlib import Path
import environ
import dj_database_url

# 1. Initialize environment framework
env = environ.Env(
    # Set casting types and robust default fallbacks
    DEBUG=(bool, False),
    SECURE_SSL_REDIRECT=(bool, True),
    SECURE_HSTS_SECONDS=(int, 31536000),
    EMAIL_BACKEND=(str, "django.core.mail.backends.smtp.EmailBackend"),
)

BASE_DIR = Path(__file__).resolve().parent.parent

# 2. Read local .env file safely (typically bypassed/ignored in actual production environments)
# In production, variables should be injected via Docker / AWS ECS / Kubernetes ConfigMaps directly
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    env.read_env(ENV_FILE)

# 3. Core Django Settings (Guaranteed Type-Cast)
DEBUG = env("DEBUG")

# CRITICAL: We DO NOT provide fallback dummy strings for production keys. 
# If it's missing, django-environ intentionally raises an ImproperlyConfigured exception immediately.
SECRET_KEY = env("SECRET_KEY")

# 4. Networking & Routing
# Directly parses comma-separated strings into lists natively.
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "web-bridgecart.up.railway.app"] if DEBUG else [])
if not DEBUG and not ALLOWED_HOSTS:
    raise environ.ImproperlyConfigured("ALLOWED_HOSTS must be explicitly defined in production.")


INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "app",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "bridgecart.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "bridgecart.wsgi.application"
ASGI_APPLICATION = "bridgecart.asgi.application"

# ── 5. DATABASE ──────────────────────────────────────────────────
# Railway automatically injects DATABASE_URL when a PostgreSQL plugin is added.
# - Locally (no DATABASE_URL):  falls back to SQLite — zero config needed.
# - On Railway (DATABASE_URL set): uses PostgreSQL automatically.

DATABASE_URL = env("DATABASE_URL", default=None)

if DATABASE_URL:
    # Production / Railway — use the injected PostgreSQL URL
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,        # persistent connections — better performance
            conn_health_checks=True, # auto-reconnect on stale connections
            ssl_require=not DEBUG,   # enforce SSL on Railway, skip locally
        )
    }
else:
    # Local development — SQLite, no setup required
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "app" / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# 5. Application Infrastructure
EMAIL_BACKEND = env("EMAIL_BACKEND")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="no-reply@yourproductiondomain.com")

# 6. Enterprise Security Middleware Stack
if not DEBUG:
    # HTTP to HTTPS Enforcement
    SECURE_SSL_REDIRECT = env("SECURE_SSL_REDIRECT")
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    
    # HTTP Strict Transport Security (HSTS)
    SECURE_HSTS_SECONDS = env("SECURE_HSTS_SECONDS")
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Browser Fingerprinting & Origin Mitigation
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
    
    # Cross-Origin Requests Validation
    CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])
    if not CSRF_TRUSTED_ORIGINS:
        raise environ.ImproperlyConfigured("CSRF_TRUSTED_ORIGINS cannot be empty in production.")