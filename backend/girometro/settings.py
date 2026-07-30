"""
Django settings for the Girometro backend.

Dev-oriented: SQLite, DEBUG on, permissive CORS so the Vite frontend
(http://localhost:5173 / :5174) can talk to it out of the box.
"""
import os
from pathlib import Path

# Let Django's MySQL backend (which imports MySQLdb) use the pure-Python
# PyMySQL driver instead — no system libs / compilation needed.
import pymysql  # noqa: E402
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security (development defaults — change for production) ---------------
SECRET_KEY = 'dev-only-insecure-key-change-me'
DEBUG = True
ALLOWED_HOSTS = ['*']

# --- Apps ------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must precede CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'girometro.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'girometro.wsgi.application'

# --- Database --------------------------------------------------------------
# Local MySQL. Password comes from the DB_PASSWORD env var; the default below
# is dev-only. To fall back to the old SQLite file, set DB_ENGINE=sqlite.
if os.environ.get('DB_ENGINE') == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.environ.get('DB_NAME', 'girometro'),
            'USER': os.environ.get('DB_USER', 'girometro'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'Girometro_2026!'),
            'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
            'PORT': os.environ.get('DB_PORT', '3306'),
            'OPTIONS': {'charset': 'utf8mb4'},
        }
    }

# --- Password validation ---------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- I18N ------------------------------------------------------------------
LANGUAGE_CODE = 'it-it'
TIME_ZONE = 'Europe/Rome'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- DRF -------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    # Reads are public; individual write views require auth explicitly.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# --- SimpleJWT -------------------------------------------------------------
from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
}

# --- CORS ------------------------------------------------------------------
# The Vite dev server runs on 5173, falling back to 5174 when busy.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
]
# Convenience in development: let any local origin through.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
