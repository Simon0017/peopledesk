# React Employee Management Masterclass

### Build *PeopleDesk*, a production-style HR platform, and become an intermediate React developer

> **Stack:** React 19 · Vite · Tailwind CSS v4 · React Router v7 · TanStack Query v5 · Axios · React Hook Form · Zod v4 · Zustand v5 · Lucide React · Recharts v3 · Vitest · React Testing Library · MSW — backed by Django · Django REST Framework · SimpleJWT · PostgreSQL

---

## Introduction

This guide is a complete, project-based React course. You start in an **empty folder** and finish with **PeopleDesk**, an Employee Management System with authentication, role-based access, employee CRUD with image uploads, departments, leave approvals, a dashboard with charts, user and role management, settings, a test suite, and a production build.

The guide is built around three ideas:

1. **Every concept is introduced when the project needs it.** You learn `useReducer` when you build the toast system, `useTransition` on the employee profile tabs, optimistic updates when you change an employee's status, and so on.
2. **Every file is complete.** When a file is created or changed, you get its full contents, not a "...rest of the code" fragment. Some files are deliberately written more than once as the app grows, such as the router and the layout. Each new version replaces the old one completely.
3. **You learn why, not only how.** Each phase explains trade-offs, alternatives, common mistakes, and the interview questions that come up around the topic.

The backend (Django + DRF) is given as concise, working code so the React frontend always talks to a real API. You won't have to learn Django to finish this course.

---

## How to Use This Guide

- **Work through the phases in order.** Later phases import files from earlier ones.
- **Type the code rather than pasting it, at least for the React parts.** Typing it builds the muscle memory.
- **Do the exercises.** They are short and they are where the learning sticks.
- **Use the checkpoints.** If you can't explain the checkpoint items out loud, re-read that phase before moving on.
- **Keep two terminals open:** one for the Django API (`backend/`), one for the Vite dev server (`frontend/`).
- Commands are shown for **Windows PowerShell** and **macOS/Linux** where they differ.

> 💡 **Interview notes** look like this. They point out questions interviewers really ask about the topic you are learning.

> ⚠️ **Common mistakes** look like this.

---

## Table of Contents

- [What You Will Build](#what-you-will-build)
- [Architecture Overview](#architecture-overview)
- [Phase 1: Development Environment and Prerequisites](#phase-1)
- [Phase 2: The Backend API (Django, DRF, PostgreSQL, JWT)](#phase-2)
- [Phase 3: Creating the React Project with Vite and How React Works](#phase-3)
- [Phase 4: Configuring Tailwind CSS v4 and Design Tokens](#phase-4)
- [Phase 5: React Fundamentals Through a Reusable UI Kit](#phase-5)
- [Phase 6: Hooks in Depth and Reusable Behaviour](#phase-6)
- [Phase 7: Application Architecture, Layout and Routing](#phase-7)
- [Phase 8: State Management Foundations (Context, useReducer, Zustand)](#phase-8)
- [Phase 9: The API Layer (Axios, Interceptors, QueryClient)](#phase-9)
- [Phase 10: Authentication, Protected Routes and Role-Based Access](#phase-10)
- [Phase 11: Server State with TanStack Query: the Employee Directory](#phase-11)
- [Phase 12: Employee CRUD: Forms, Validation, Uploads and Mutations](#phase-12)
- [Phase 13: Department Management](#phase-13)
- [Phase 14: Leave Management](#phase-14)
- [Phase 15: The Dashboard and Data Visualisation](#phase-15)
- [Phase 16: User and Role Management](#phase-16)
- [Phase 17: Settings and Profile](#phase-17)
- [Phase 18: Performance Optimisation](#phase-18)
- [Phase 19: Error Boundaries, Resilience and Async UI States](#phase-19)
- [Phase 20: Testing with Vitest, React Testing Library and MSW](#phase-20)
- [Phase 21: Production Readiness and Deployment](#phase-21)
- [Appendix A: API Reference](#appendix-a)
- [Appendix B: Final Folder Structure](#appendix-b)
- [Appendix C: React Concepts Checklist](#appendix-c)
- [Appendix D: Project Completion Checklist](#appendix-d)
- [Appendix E: Intermediate React Interview Questions and Answers](#appendix-e)
- [Appendix F: Practical Coding Challenges](#appendix-f)
- [Appendix G: Suggested Independent Modifications](#appendix-g)
- [Appendix H: Before You Apply for Intermediate React Roles](#appendix-h)
- [Appendix I: Beyond Intermediate: Next Steps](#appendix-i)
- [Appendix J: References and Official Documentation](#appendix-j)

---

<a id="what-you-will-build"></a>

## What You Will Build

**PeopleDesk** is a single-page HR application with three roles:

| Role | Can do |
|---|---|
| **Admin** | Everything, including deleting employees and managing user accounts and roles |
| **HR** | Manage employees and departments, review leave requests, see activity |
| **Employee** | Browse the directory and departments, request and cancel their own leave, manage their profile |

**Features**

| Area | Features |
|---|---|
| Authentication | Email + password login, JWT access/refresh tokens, silent token refresh, persistent sessions, logout with token blacklisting, protected and role-based routes |
| Dashboard | KPI cards, employees per department (bar chart), status breakdown (donut chart), hires per month (area chart), recent activity feed, background refresh |
| Employees | Server-side search, filtering, sorting and pagination stored in the URL; multi-step create/edit form; profile photo upload; emergency contacts (dynamic fields); profile page with tabs; delete with confirmation; inline status change with optimistic updates |
| Departments | Create, edit, view, delete; department detail with members; assign and remove employees |
| Leave | Request leave with validation, my leave history, cancel pending requests, HR approval queue with approve/reject notes, status tracking |
| Users & roles | Admin-only user accounts, role assignment, activation/deactivation, permission matrix |
| Settings | Profile update, password change, theme (light/dark/system), default page size, table density |
| Quality | Error boundaries, offline banner, toasts, skeletons, empty and error states, lazy-loaded routes, tests |

---

<a id="architecture-overview"></a>

## Architecture Overview

```text
┌──────────────────────────── Browser (Vite + React SPA) ─────────────────────────────┐
│                                                                                     │
│  React Router ──► Layouts ──► Pages ──► Feature components ──► UI kit components     │
│                                   │                                                 │
│                    ┌──────────────┼───────────────────────────┐                     │
│                    ▼              ▼                           ▼                     │
│            Local UI state   Global client state         Server state                │
│            (useState,       (Zustand: session,          (TanStack Query:            │
│             useReducer)      theme, preferences)         cache, refetch,            │
│                              (Context: toasts)           mutations)                 │
│                                                              │                      │
│                                                    Axios instance + interceptors     │
│                                                    (JWT header, silent refresh)      │
└──────────────────────────────────────────────────────────────┼──────────────────────┘
                                                               │  HTTPS / JSON / multipart
┌──────────────────────────── Django REST Framework API ───────▼──────────────────────┐
│  SimpleJWT auth · Role permissions · ViewSets · Filtering/search/ordering/pagination │
│  Models: User(role) · Department · Employee · LeaveRequest · Activity                │
└──────────────────────────────────────────────┬──────────────────────────────────────┘
                                               ▼
                                          PostgreSQL
```

The most important architectural idea in this course is the split between three kinds of state:

| Kind | Examples in PeopleDesk | Tool |
|---|---|---|
| **Local UI state** | Is this modal open? Which wizard step am I on? What is typed in this input? | `useState`, `useReducer` |
| **Global client state** | Who is logged in, the theme, sidebar collapsed, preferred page size, toasts | Zustand, Context |
| **Server state** | Employees, departments, leave requests, dashboard stats | TanStack Query |
| *(bonus)* **URL state** | Current page, search term, filters, sort order, active settings tab | React Router `useSearchParams` |

You will come back to this table many times.

---

<a id="phase-1"></a>

## Phase 1: Development Environment and Prerequisites

### 1.1 Learning objectives

- Install and verify the tools for a modern React + Django workflow.
- Understand what each tool is for.
- Set up a sensible editor and browser for React development.

### 1.2 What you need and why

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 22 LTS or newer (20.19+ minimum) | Runs Vite, npm and the test runner. Vite needs a recent Node. |
| **npm** | Comes with Node | Installs JavaScript packages. |
| **Python** | 3.12 or 3.13 | Runs Django. |
| **PostgreSQL** | 16 or 17 | The database. |
| **Git** | Any recent | Version control. Commit after every phase. |
| **VS Code** | Latest | Editor. |
| **Chrome or Firefox** | Latest | Plus the **React Developer Tools** extension. |

### 1.3 Install and verify

Install Node.js LTS from <https://nodejs.org>, Python from <https://www.python.org/downloads/>, PostgreSQL from <https://www.postgresql.org/download/>, and Git from <https://git-scm.com>.

Then check each one:

```bash
node --version
```

```bash
npm --version
```

```bash
python --version
```

```bash
psql --version
```

```bash
git --version
```

On macOS/Linux, Python may be `python3`. On Windows, if `psql` is not found, add `C:\Program Files\PostgreSQL\17\bin` to your `PATH` (use your installed version number).

### 1.4 Recommended VS Code extensions

- **ES7+ React/Redux/React-Native snippets**: snippets such as `rafce`.
- **ESLint**: shows lint errors inline. Vite's template ships an ESLint config that includes the React Hooks rules.
- **Prettier**: consistent formatting.
- **Tailwind CSS IntelliSense**: autocomplete for class names.
- **Python** (Microsoft): for the backend.

Install the **React Developer Tools** browser extension. You will use its **Components** tab (inspect props, state and hooks) and its **Profiler** tab (Phase 18).

### 1.5 Create the workspace

```bash
mkdir peopledesk
```

```bash
cd peopledesk
```

```bash
git init
```

By the end, the workspace looks like this:

```text
peopledesk/
├── backend/     ← Django + DRF API (Phase 2)
└── frontend/    ← Vite + React app (Phase 3 onwards)
```

### 1.6 Common mistakes

> ⚠️ **Old Node version.** Vite fails with odd syntax errors on old Node versions. Run `node --version`. If it is below 20.19, upgrade. Tools such as `nvm` (macOS/Linux) or `nvm-windows` let you switch versions.

> ⚠️ **Forgetting the PostgreSQL password** you set during installation. You need it in Phase 2.

### 1.7 Checkpoint

Before continuing you should have Node, npm, Python, PostgreSQL and Git installed and verified, the React DevTools extension in your browser, and an empty `peopledesk/` folder under Git.

---

<a id="phase-2"></a>

## Phase 2: The Backend API (Django, DRF, PostgreSQL, JWT)

### 2.1 Learning objectives

- Stand up a working REST API that supports **every** frontend feature in this course.
- Know the **API contract**: the endpoints, payloads and response shapes the React app depends on.

> This phase is intentionally light on Django explanation. Copy the code, run it, check it works, and move on. React is the focus. The comments in the code explain the important decisions.

### 2.2 Why build the backend first?

Frontend developers usually work against a real API contract. Building the API first means that **no frontend call in this course points to an endpoint that doesn't exist**, and you learn real-world concerns (JWT expiry, pagination envelopes, validation error shapes, file uploads) from day one.

### 2.3 Create the PostgreSQL database

Open a PostgreSQL shell as the `postgres` superuser:

```bash
psql -U postgres
```

Then run these SQL statements one at a time:

```sql
CREATE DATABASE peopledesk;
CREATE USER peopledesk WITH PASSWORD 'peopledesk';
ALTER DATABASE peopledesk OWNER TO peopledesk;
\q
```

Making `peopledesk` the **owner** avoids the "permission denied for schema public" error that PostgreSQL 15+ raises for non-owners.

### 2.4 Create the Django project

```bash
mkdir backend
```

```bash
cd backend
```

Create and activate a virtual environment.

**Windows PowerShell:**

```bash
python -m venv .venv
```

```bash
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

Create `backend/requirements.txt`:

```text
Django>=5.2,<5.3
djangorestframework>=3.16,<3.17
djangorestframework-simplejwt>=5.5,<6
django-cors-headers>=4.7,<5
django-filter>=25.1
psycopg[binary]>=3.2,<4
Pillow>=11.0
python-dotenv>=1.0
```

Django 5.2 is the current LTS (long-term support) release. Install everything:

```bash
pip install -r requirements.txt
```

Create the project (the trailing `.` puts `manage.py` in `backend/`) and two apps:

```bash
django-admin startproject config .
```

```bash
python manage.py startapp accounts
```

```bash
python manage.py startapp hr
```

Create the management command folders used by the seed script later.

**Windows PowerShell:**

```bash
New-Item -ItemType Directory -Force hr/management/commands; New-Item -ItemType File hr/management/__init__.py, hr/management/commands/__init__.py
```

**macOS/Linux:**

```bash
mkdir -p hr/management/commands && touch hr/management/__init__.py hr/management/commands/__init__.py
```

Final backend layout:

```text
backend/
├── .env
├── manage.py
├── requirements.txt
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── pagination.py
│   ├── asgi.py
│   └── wsgi.py
├── accounts/          ← custom User with role, auth endpoints, user admin API
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── urls_auth.py
│   └── admin.py
└── hr/                ← departments, employees, leave, activity, dashboard
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── activity.py
    ├── admin.py
    └── management/commands/seed_demo.py
```

### 2.5 Environment variables

Create `backend/.env`:

```ini
DJANGO_SECRET_KEY=dev-only-change-me-to-a-long-random-string
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=peopledesk
POSTGRES_USER=peopledesk
POSTGRES_PASSWORD=peopledesk
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Add `.env`, `.venv/` and `media/` to a `.gitignore` in `backend/`:

```text
.venv/
.env
media/
staticfiles/
__pycache__/
*.pyc
```

### 2.6 Settings

Replace **`backend/config/settings.py`** completely:

```python
"""Django settings for the PeopleDesk API."""
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_list(name, default=""):
    """Read a comma-separated environment variable into a list."""
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-insecure-key")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",  # enables logout + refresh rotation
    "django_filters",
    "corsheaders",
    # Local
    "accounts",
    "hr",
]

MIDDLEWARE = [
    # CORS must run before CommonMiddleware so preflight requests get headers.
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "peopledesk"),
        "USER": os.getenv("POSTGRES_USER", "peopledesk"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "peopledesk"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Must be set BEFORE the first migration. Changing it later is painful.
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Secure by default: every endpoint requires a logged-in user unless it opts out.
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "config.pagination.StandardPagination",
    "PAGE_SIZE": 10,
}

SIMPLE_JWT = {
    # Short-lived access token. Set to minutes=1 temporarily to watch silent refresh work.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # Every refresh returns a NEW refresh token and blacklists the old one.
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
```

Create **`backend/config/pagination.py`**:

```python
from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Page-number pagination where the client can choose the page size.

    Response envelope: {"count": int, "next": url|null, "previous": url|null, "results": [...]}
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
```

### 2.7 Accounts app: users, roles, permissions, auth endpoints

**`backend/accounts/models.py`**

```python
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class Role(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    HR = "HR", "HR"
    EMPLOYEE = "EMPLOYEE", "Employee"


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        # Superusers created with `createsuperuser` should be app admins too.
        extra_fields.setdefault("role", Role.ADMIN)
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    """Users log in with email. `role` drives authorisation across the API and the UI."""

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    phone = models.CharField(max_length=30, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email
```

**`backend/accounts/permissions.py`**

```python
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Role


def _has_role(user, *roles):
    return bool(user and user.is_authenticated and user.role in roles)


class IsAdmin(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return _has_role(request.user, Role.ADMIN)


class IsAdminOrHR(BasePermission):
    message = "Only HR staff or administrators can perform this action."

    def has_permission(self, request, view):
        return _has_role(request.user, Role.ADMIN, Role.HR)


class ReadOnlyOrAdminHR(BasePermission):
    """Any authenticated user may read; only Admin/HR may write."""

    message = "You do not have permission to modify this resource."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return _has_role(request.user, Role.ADMIN, Role.HR)
```

**`backend/accounts/serializers.py`**

```python
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Used by admins to manage accounts."""

    password = serializers.CharField(write_only=True, required=False, min_length=8)
    full_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name", "full_name",
            "role", "phone", "is_active", "date_joined", "employee_id", "password",
        ]
        read_only_fields = ["id", "date_joined"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_employee_id(self, obj):
        # The linked Employee row's primary key (or None). The frontend uses it
        # to filter "my" leave requests.
        profile = getattr(obj, "employee_profile", None)
        return profile.id if profile else None

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "Password is required."})
        if attrs.get("password"):
            validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # never store raw passwords
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MeSerializer(serializers.ModelSerializer):
    """The logged-in user's own profile. Role and email cannot be self-edited."""

    full_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "full_name", "role", "phone", "employee_id",
        ]
        read_only_fields = ["id", "email", "username", "role", "employee_id"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_employee_id(self, obj):
        profile = getattr(obj, "employee_profile", None)
        return profile.id if profile else None


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Your current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value
```

**`backend/accounts/views.py`**

```python
from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsAdmin
from .serializers import ChangePasswordSerializer, MeSerializer, UserSerializer


class LogoutView(APIView):
    """Blacklists the refresh token so it can never be used again."""

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            pass  # already expired or blacklisted: logout stays idempotent
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ModelViewSet):
    """Admin-only account management. Not paginated: the frontend filters it client-side."""

    queryset = User.objects.all().order_by("first_name", "last_name")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None
    search_fields = ["email", "first_name", "last_name", "username"]
    filterset_fields = ["role", "is_active"]

    def destroy(self, request, *args, **kwargs):
        if self.get_object().pk == request.user.pk:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
```

**`backend/accounts/urls_auth.py`**

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import ChangePasswordView, LogoutView, MeView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),       # {email, password} -> {access, refresh}
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),      # {refresh} -> {access, refresh}
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
]
```

**`backend/accounts/urls.py`**

```python
from rest_framework.routers import DefaultRouter

from .views import UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = router.urls
```

**`backend/accounts/admin.py`**

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (("PeopleDesk", {"fields": ("role", "phone")}),)
    list_display = ("email", "username", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active")
```

### 2.8 HR app: departments, employees, leave, activity, dashboard

**`backend/hr/models.py`**

```python
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class EmployeeStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"
    ON_LEAVE = "ON_LEAVE", "On leave"


def avatar_upload_path(instance, filename):
    # Random file names avoid collisions and don't leak original file names.
    return f"avatars/{uuid4().hex}{Path(filename).suffix.lower()}"


class Employee(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="employee_profile",
    )
    # Generated after the first save, e.g. EMP-00042. NULLs don't clash on unique.
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    job_title = models.CharField(max_length=120)
    department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.SET_NULL, related_name="employees",
    )
    status = models.CharField(max_length=20, choices=EmployeeStatus.choices, default=EmployeeStatus.ACTIVE)
    hire_date = models.DateField()
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    # A list of {"name", "relationship", "phone"} objects (dynamic form in the UI).
    emergency_contacts = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.employee_id:
            self.employee_id = f"EMP-{self.pk:05d}"
            super().save(update_fields=["employee_id"])


class LeaveType(models.TextChoices):
    ANNUAL = "ANNUAL", "Annual"
    SICK = "SICK", "Sick"
    UNPAID = "UNPAID", "Unpaid"
    OTHER = "OTHER", "Other"


class LeaveStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    CANCELLED = "CANCELLED", "Cancelled"


class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=LeaveStatus.choices, default=LeaveStatus.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="reviewed_leaves",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def days(self):
        return (self.end_date - self.start_date).days + 1


class Activity(models.Model):
    """An audit-style feed shown on the dashboard and employee profile."""

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    verb = models.CharField(max_length=50)
    target_type = models.CharField(max_length=50)
    target_id = models.PositiveBigIntegerField(null=True, blank=True)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "activities"
```

**`backend/hr/activity.py`**

```python
from .models import Activity


def log_activity(actor, verb, target, description):
    """Record who did what to which object. target_type is e.g. 'employee'."""
    Activity.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        verb=verb,
        target_type=target._meta.model_name,
        target_id=target.pk,
        description=description,
    )
```

**`backend/hr/serializers.py`**

```python
from rest_framework import serializers

from .models import Activity, Department, Employee, LeaveRequest, LeaveStatus

MAX_AVATAR_BYTES = 2 * 1024 * 1024
MAX_EMERGENCY_CONTACTS = 5


class DepartmentSerializer(serializers.ModelSerializer):
    # Comes from a queryset annotation; default=0 covers freshly created rows.
    employee_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Department
        fields = ["id", "name", "code", "description", "employee_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_code(self, value):
        return value.strip().upper()


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Employee
        fields = [
            "id", "employee_id", "user", "first_name", "last_name", "full_name",
            "email", "phone", "job_title", "department", "department_name",
            "status", "hire_date", "avatar", "emergency_contacts",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "employee_id", "user", "created_at", "updated_at"]

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def validate_avatar(self, value):
        if value and value.size > MAX_AVATAR_BYTES:
            raise serializers.ValidationError("Image must be 2 MB or smaller.")
        return value

    def validate_emergency_contacts(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list of contacts.")
        if len(value) > MAX_EMERGENCY_CONTACTS:
            raise serializers.ValidationError(f"Add at most {MAX_EMERGENCY_CONTACTS} contacts.")
        cleaned = []
        for contact in value:
            if not isinstance(contact, dict) or not contact.get("name") or not contact.get("phone"):
                raise serializers.ValidationError("Each contact needs a name and a phone number.")
            cleaned.append({
                "name": str(contact["name"]).strip(),
                "relationship": str(contact.get("relationship", "")).strip(),
                "phone": str(contact["phone"]).strip(),
            })
        return cleaned


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()
    days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id", "employee", "employee_name", "leave_type", "start_date", "end_date",
            "days", "reason", "status", "review_note", "reviewed_by_name",
            "reviewed_at", "created_at",
        ]
        read_only_fields = ["id", "employee", "status", "review_note", "reviewed_at", "created_at"]

    def get_reviewed_by_name(self, obj):
        return obj.reviewed_by.get_full_name() if obj.reviewed_by else None

    def validate(self, attrs):
        start, end = attrs["start_date"], attrs["end_date"]
        if end < start:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})

        employee = getattr(self.context["request"].user, "employee_profile", None)
        if employee is None:
            # Returned as {"non_field_errors": [...]} and shown as a form-level error.
            raise serializers.ValidationError("Your account is not linked to an employee profile.")

        overlaps = LeaveRequest.objects.filter(
            employee=employee,
            status__in=[LeaveStatus.PENDING, LeaveStatus.APPROVED],
            start_date__lte=end,
            end_date__gte=start,
        ).exists()
        if overlaps:
            raise serializers.ValidationError(
                {"start_date": "This request overlaps an existing pending or approved leave."}
            )
        return attrs


class LeaveReviewSerializer(serializers.Serializer):
    review_note = serializers.CharField(required=False, allow_blank=True, max_length=500)


class ActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ["id", "actor_name", "verb", "target_type", "target_id", "description", "created_at"]

    def get_actor_name(self, obj):
        if obj.actor is None:
            return "System"
        return obj.actor.get_full_name() or obj.actor.email
```

**`backend/hr/views.py`**

```python
from datetime import date

from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Role
from accounts.permissions import IsAdmin, IsAdminOrHR, ReadOnlyOrAdminHR

from .activity import log_activity
from .models import Activity, Department, Employee, EmployeeStatus, LeaveRequest, LeaveStatus
from .serializers import (
    ActivitySerializer,
    DepartmentSerializer,
    EmployeeSerializer,
    LeaveRequestSerializer,
    LeaveReviewSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, ReadOnlyOrAdminHR]
    pagination_class = None  # a short list used in dropdowns and cards
    search_fields = ["name", "code"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        return Department.objects.annotate(employee_count=Count("employees"))

    def perform_create(self, serializer):
        department = serializer.save()
        log_activity(self.request.user, "created", department, f"Created department {department.name}")

    def perform_update(self, serializer):
        department = serializer.save()
        log_activity(self.request.user, "updated", department, f"Updated department {department.name}")

    def perform_destroy(self, instance):
        log_activity(self.request.user, "deleted", instance, f"Deleted department {instance.name}")
        instance.delete()  # employees keep existing; their department becomes NULL


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department", "user")
    serializer_class = EmployeeSerializer
    # JSON for simple PATCHes (status, department); multipart for forms with a photo.
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filterset_fields = ["department", "status"]
    search_fields = ["first_name", "last_name", "email", "employee_id", "job_title"]
    ordering_fields = ["first_name", "last_name", "job_title", "hire_date", "status", "created_at"]
    ordering = ["last_name", "first_name"]

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), ReadOnlyOrAdminHR()]

    def perform_create(self, serializer):
        employee = serializer.save()
        log_activity(self.request.user, "created", employee, f"Added employee {employee.full_name}")

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        employee = serializer.save()
        if employee.status != previous_status:
            description = f"Changed {employee.full_name}'s status to {employee.get_status_display()}"
        else:
            description = f"Updated employee {employee.full_name}"
        log_activity(self.request.user, "updated", employee, description)

    def perform_destroy(self, instance):
        log_activity(self.request.user, "deleted", instance, f"Deleted employee {instance.full_name}")
        instance.delete()


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    # Leave requests are never edited or deleted, only created and moved through states.
    http_method_names = ["get", "post", "head", "options"]
    filterset_fields = ["status", "employee", "leave_type"]
    ordering_fields = ["created_at", "start_date"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = LeaveRequest.objects.select_related("employee", "reviewed_by")
        if self.request.user.role in (Role.ADMIN, Role.HR):
            return queryset
        return queryset.filter(employee__user=self.request.user)  # employees see only their own

    def perform_create(self, serializer):
        leave = serializer.save(employee=self.request.user.employee_profile)
        log_activity(self.request.user, "requested", leave.employee,
                     f"{leave.employee.full_name} requested {leave.days} day(s) of leave")

    def _review(self, request, new_status):
        leave = self.get_object()
        if leave.status != LeaveStatus.PENDING:
            raise ValidationError({"detail": "Only pending requests can be reviewed."})
        if leave.employee.user_id == request.user.id:
            raise PermissionDenied("You cannot review your own leave request.")
        review = LeaveReviewSerializer(data=request.data)
        review.is_valid(raise_exception=True)

        leave.status = new_status
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.review_note = review.validated_data.get("review_note", "")
        leave.save()
        log_activity(request.user, new_status.lower(), leave.employee,
                     f"{leave.get_status_display()} leave for {leave.employee.full_name}")
        return Response(self.get_serializer(leave).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrHR])
    def approve(self, request, pk=None):
        return self._review(request, LeaveStatus.APPROVED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrHR])
    def reject(self, request, pk=None):
        return self._review(request, LeaveStatus.REJECTED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        leave = self.get_object()
        if leave.employee.user_id != request.user.id:
            raise PermissionDenied("You can only cancel your own requests.")
        if leave.status != LeaveStatus.PENDING:
            raise ValidationError({"detail": "Only pending requests can be cancelled."})
        leave.status = LeaveStatus.CANCELLED
        leave.save(update_fields=["status"])
        return Response(self.get_serializer(leave).data)


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.select_related("actor")
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]
    filterset_fields = ["target_type", "target_id"]


def _last_month_starts(count=12):
    """First day of each of the last `count` months, oldest first."""
    today = timezone.localdate().replace(day=1)
    year, month = today.year, today.month
    months = []
    for _ in range(count):
        months.append(date(year, month, 1))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(months))


class DashboardStatsView(APIView):
    def get(self, request):
        employees = Employee.objects.all()
        status_counts = {row["status"]: row["count"] for row in employees.values("status").annotate(count=Count("id"))}

        by_department = [
            {"name": row["name"], "count": row["count"]}
            for row in Department.objects.annotate(count=Count("employees")).values("name", "count")
        ]
        unassigned = employees.filter(department__isnull=True).count()
        if unassigned:
            by_department.append({"name": "Unassigned", "count": unassigned})

        months = _last_month_starts()
        hires = (
            employees.filter(hire_date__gte=months[0])
            .annotate(month=TruncMonth("hire_date"))
            .values("month")
            .annotate(count=Count("id"))
        )
        hires_by_month = {row["month"]: row["count"] for row in hires}

        is_staff_role = request.user.role in (Role.ADMIN, Role.HR)
        recent = Activity.objects.select_related("actor")[:8] if is_staff_role else []

        return Response({
            "total_employees": employees.count(),
            "active_employees": status_counts.get(EmployeeStatus.ACTIVE, 0),
            "inactive_employees": status_counts.get(EmployeeStatus.INACTIVE, 0),
            "on_leave_employees": status_counts.get(EmployeeStatus.ON_LEAVE, 0),
            "total_departments": Department.objects.count(),
            "pending_leaves": LeaveRequest.objects.filter(status=LeaveStatus.PENDING).count(),
            "by_department": by_department,
            "by_status": [{"status": key, "count": status_counts.get(key, 0)} for key in EmployeeStatus.values],
            "hires_by_month": [
                {"month": month.strftime("%Y-%m"), "count": hires_by_month.get(month, 0)} for month in months
            ],
            # Only Admin/HR see the activity feed; employees get an empty list.
            "recent_activity": ActivitySerializer(recent, many=True).data,
        }, status=status.HTTP_200_OK)
```

**`backend/hr/urls.py`**

```python
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ActivityViewSet, DashboardStatsView, DepartmentViewSet, EmployeeViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("employees", EmployeeViewSet, basename="employee")
router.register("leaves", LeaveRequestViewSet, basename="leave")
router.register("activities", ActivityViewSet, basename="activity")

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    *router.urls,
]
```

**`backend/hr/admin.py`**

```python
from django.contrib import admin

from .models import Activity, Department, Employee, LeaveRequest

admin.site.register(Department)
admin.site.register(Activity)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "email", "department", "status")
    list_filter = ("status", "department")
    search_fields = ("first_name", "last_name", "email", "employee_id")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "status")
    list_filter = ("status", "leave_type")
```

**`backend/config/urls.py`**

```python
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls_auth")),
    path("api/", include("accounts.urls")),
    path("api/", include("hr.urls")),
]

# Serve uploaded avatars in development. In production a web server or object store does this.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 2.9 Demo data

**`backend/hr/management/commands/seed_demo.py`**

```python
import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import Role, User
from hr.models import Activity, Department, Employee, EmployeeStatus, LeaveRequest, LeaveStatus, LeaveType

DEMO_PASSWORD = "ChangeMe123!"

DEPARTMENTS = [
    ("Engineering", "ENG", "Builds and maintains our products."),
    ("Human Resources", "HR", "Hiring, onboarding and people operations."),
    ("Finance", "FIN", "Budgets, payroll and reporting."),
    ("Sales", "SAL", "Grows revenue and client relationships."),
    ("Marketing", "MKT", "Brand, campaigns and content."),
    ("Operations", "OPS", "Keeps the business running smoothly."),
]
JOB_TITLES = {
    "ENG": ["Software Engineer", "Senior Engineer", "QA Engineer", "DevOps Engineer"],
    "HR": ["HR Generalist", "Recruiter", "People Partner"],
    "FIN": ["Accountant", "Financial Analyst", "Payroll Specialist"],
    "SAL": ["Account Executive", "Sales Manager", "Sales Associate"],
    "MKT": ["Content Writer", "Marketing Manager", "Designer"],
    "OPS": ["Operations Analyst", "Office Manager", "Logistics Coordinator"],
}
FIRST_NAMES = ["Amara", "Liam", "Sofia", "Noah", "Zara", "Ethan", "Maya", "Kofi", "Lena", "Omar",
               "Priya", "Lucas", "Chen", "Aisha", "Mateo", "Hana", "Diego", "Nia", "Ivan", "Elif"]
LAST_NAMES = ["Okafor", "Smith", "Garcia", "Kim", "Mensah", "Novak", "Patel", "Rossi", "Haddad", "Silva",
              "Tanaka", "Nguyen", "Ibrahim", "Kowalski", "Mwangi", "Dubois", "Larsen", "Costa", "Ali", "Brown"]


class Command(BaseCommand):
    help = "Seed demo departments, users, employees, leave requests and activity."

    def add_arguments(self, parser):
        parser.add_argument("--employees", type=int, default=45)
        parser.add_argument("--reset", action="store_true", help="Delete existing demo data first.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(42)  # deterministic: everyone gets the same demo data
        today = date.today()

        if options["reset"]:
            LeaveRequest.objects.all().delete()
            Activity.objects.all().delete()
            Employee.objects.all().delete()
            Department.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        departments = {}
        for name, code, description in DEPARTMENTS:
            departments[code], _ = Department.objects.get_or_create(
                code=code, defaults={"name": name, "description": description}
            )

        demo_accounts = [
            ("admin@peopledesk.test", "admin", "Ada", "Admin", Role.ADMIN, "OPS", "Operations Director"),
            ("hr@peopledesk.test", "hr", "Harper", "Reed", Role.HR, "HR", "HR Manager"),
            ("employee@peopledesk.test", "employee", "Evan", "Stone", Role.EMPLOYEE, "ENG", "Software Engineer"),
        ]
        for email, username, first, last, role, dept_code, title in demo_accounts:
            user, created = User.objects.get_or_create(
                email=email, defaults={"username": username, "first_name": first, "last_name": last, "role": role}
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            Employee.objects.get_or_create(email=email, defaults={
                "user": user, "first_name": first, "last_name": last, "job_title": title,
                "department": departments[dept_code], "phone": "+1 555 0100",
                "hire_date": today - timedelta(days=rng.randint(200, 900)),
            })

        existing = Employee.objects.count()
        for index in range(max(0, options["employees"] - existing)):
            first, last = rng.choice(FIRST_NAMES), rng.choice(LAST_NAMES)
            code = rng.choice(list(departments))
            Employee.objects.create(
                first_name=first,
                last_name=last,
                email=f"{first}.{last}.{existing + index}@peopledesk.test".lower(),
                phone=f"+1 555 {rng.randint(1000, 9999)}",
                job_title=rng.choice(JOB_TITLES[code]),
                department=departments[code],
                status=rng.choices(
                    [EmployeeStatus.ACTIVE, EmployeeStatus.INACTIVE, EmployeeStatus.ON_LEAVE], weights=[80, 12, 8]
                )[0],
                hire_date=today - timedelta(days=rng.randint(10, 1100)),
                emergency_contacts=[{
                    "name": f"{rng.choice(FIRST_NAMES)} {last}",
                    "relationship": rng.choice(["Spouse", "Parent", "Sibling"]),
                    "phone": f"+1 555 {rng.randint(1000, 9999)}",
                }],
            )

        if not LeaveRequest.objects.exists():
            reviewer = User.objects.get(email="hr@peopledesk.test")
            evan = Employee.objects.get(email="employee@peopledesk.test")
            employees = list(Employee.objects.exclude(pk=evan.pk))
            for _ in range(25):
                start = today + timedelta(days=rng.randint(-60, 45))
                leave_status = rng.choice([LeaveStatus.PENDING, LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED])
                reviewed = leave_status != LeaveStatus.PENDING
                LeaveRequest.objects.create(
                    employee=rng.choice(employees),
                    leave_type=rng.choice(LeaveType.values),
                    start_date=start,
                    end_date=start + timedelta(days=rng.randint(0, 6)),
                    reason="Time off requested through the demo seed data.",
                    status=leave_status,
                    reviewed_by=reviewer if reviewed else None,
                    reviewed_at=timezone.now() if reviewed else None,
                    review_note="Enjoy your time off." if leave_status == LeaveStatus.APPROVED
                    else ("Team coverage is too low that week." if reviewed else ""),
                )
            # Give the demo employee their own history.
            LeaveRequest.objects.create(employee=evan, leave_type=LeaveType.ANNUAL,
                                        start_date=today - timedelta(days=40), end_date=today - timedelta(days=36),
                                        reason="Family holiday by the coast.", status=LeaveStatus.APPROVED,
                                        reviewed_by=reviewer, reviewed_at=timezone.now(), review_note="Approved.")
            LeaveRequest.objects.create(employee=evan, leave_type=LeaveType.SICK,
                                        start_date=today + timedelta(days=10), end_date=today + timedelta(days=11),
                                        reason="Scheduled minor surgery and recovery.")

        if not Activity.objects.exists():
            admin = User.objects.get(email="admin@peopledesk.test")
            for employee in Employee.objects.order_by("-created_at")[:5]:
                Activity.objects.create(actor=admin, verb="created", target_type="employee",
                                        target_id=employee.pk, description=f"Added employee {employee.full_name}")

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Employee.objects.count()} employees. Demo password for all demo accounts: {DEMO_PASSWORD}"
        ))
```

### 2.10 Migrate, seed and run

```bash
python manage.py makemigrations accounts hr
```

```bash
python manage.py migrate
```

```bash
python manage.py seed_demo
```

```bash
python manage.py runserver
```

The API is now running at `http://localhost:8000/api/`. The demo accounts are:

| Email | Role | Password |
|---|---|---|
| `admin@peopledesk.test` | Admin | `ChangeMe123!` |
| `hr@peopledesk.test` | HR | `ChangeMe123!` |
| `employee@peopledesk.test` | Employee | `ChangeMe123!` |

Smoke-test login. On macOS/Linux (or Git Bash on Windows):

```bash
curl -X POST http://localhost:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"email":"hr@peopledesk.test","password":"ChangeMe123!"}'
```

In Windows PowerShell:

```bash
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/auth/login/ -ContentType "application/json" -Body '{"email":"hr@peopledesk.test","password":"ChangeMe123!"}'
```

You should get back `{"access": "...", "refresh": "..."}`. You can also open `http://localhost:8000/api/` in a browser after logging into `/admin/` to explore DRF's browsable API. To use `/admin/`, run `python manage.py createsuperuser` first.

<a id="api-contract"></a>

### 2.11 The API contract (what the React app depends on)

All endpoints are under `http://localhost:8000/api`. Every endpoint except `auth/login/` and `auth/refresh/` needs `Authorization: Bearer <access>`.

| Method | Endpoint | Who | Body / params | Response |
|---|---|---|---|---|
| POST | `/auth/login/` | Anyone | `{email, password}` | `{access, refresh}` · 401 `{detail}` |
| POST | `/auth/refresh/` | Anyone | `{refresh}` | `{access, refresh}` (rotated) · 401 |
| POST | `/auth/logout/` | Auth | `{refresh}` | 204 |
| GET / PATCH | `/auth/me/` | Auth | PATCH `{first_name, last_name, phone}` | `User` |
| POST | `/auth/change-password/` | Auth | `{current_password, new_password}` | 204 · 400 `{current_password: [...]}` |
| GET / POST | `/users/` | Admin | POST `{email, username, first_name, last_name, role, phone, is_active, password}` | `User[]` (not paginated) |
| GET / PATCH / DELETE | `/users/{id}/` | Admin | PATCH any field (password optional) | `User` |
| GET / POST | `/departments/` | Read: all · Write: Admin/HR | `?search=` · POST `{name, code, description}` | `Department[]` (not paginated) |
| GET / PATCH / DELETE | `/departments/{id}/` | Read: all · Write: Admin/HR | | `Department` |
| GET | `/employees/` | All | `?page, page_size, search, department, status, ordering` | `Paginated<Employee>` |
| POST | `/employees/` | Admin/HR | `multipart/form-data` (see below) | `Employee` 201 |
| GET | `/employees/{id}/` | All | | `Employee` |
| PATCH | `/employees/{id}/` | Admin/HR | JSON (e.g. `{status}`, `{department}`) or multipart | `Employee` |
| DELETE | `/employees/{id}/` | Admin | | 204 |
| GET | `/leaves/` | All (employees see only their own) | `?page, page_size, status, employee, leave_type, ordering` | `Paginated<LeaveRequest>` |
| POST | `/leaves/` | Users with an employee profile | `{leave_type, start_date, end_date, reason}` | `LeaveRequest` 201 |
| POST | `/leaves/{id}/approve/` | Admin/HR | `{review_note?}` | `LeaveRequest` |
| POST | `/leaves/{id}/reject/` | Admin/HR | `{review_note?}` | `LeaveRequest` |
| POST | `/leaves/{id}/cancel/` | Owner | | `LeaveRequest` |
| GET | `/activities/` | Admin/HR | `?target_type, target_id, page, page_size` | `Paginated<Activity>` |
| GET | `/dashboard/stats/` | All | | `DashboardStats` |

**Paginated envelope**

```json
{
  "count": 46,
  "next": "http://localhost:8000/api/employees/?page=2",
  "previous": null,
  "results": []
}
```

**User**

```json
{
  "id": 2,
  "email": "hr@peopledesk.test",
  "username": "hr",
  "first_name": "Harper",
  "last_name": "Reed",
  "full_name": "Harper Reed",
  "role": "HR",
  "phone": "",
  "is_active": true,
  "date_joined": "2026-11-02T09:15:00Z",
  "employee_id": 2
}
```

`/auth/me/` returns the same shape without `is_active` and `date_joined`. `role` is one of `ADMIN`, `HR`, `EMPLOYEE`.

**Department**

```json
{ "id": 1, "name": "Engineering", "code": "ENG", "description": "Builds and maintains our products.", "employee_count": 9, "created_at": "2026-11-02T09:15:00Z" }
```

**Employee**

```json
{
  "id": 14,
  "employee_id": "EMP-00014",
  "user": null,
  "first_name": "Amara",
  "last_name": "Okafor",
  "full_name": "Amara Okafor",
  "email": "amara.okafor.13@peopledesk.test",
  "phone": "+1 555 4821",
  "job_title": "Senior Engineer",
  "department": 1,
  "department_name": "Engineering",
  "status": "ACTIVE",
  "hire_date": "2025-04-17",
  "avatar": "http://localhost:8000/media/avatars/3f2a....jpg",
  "emergency_contacts": [{ "name": "Kofi Okafor", "relationship": "Sibling", "phone": "+1 555 1200" }],
  "created_at": "2026-11-02T09:15:00Z",
  "updated_at": "2026-11-02T09:15:00Z"
}
```

`status` is one of `ACTIVE`, `INACTIVE`, `ON_LEAVE`. `avatar` may be `null`.

**Employee create/update (multipart/form-data fields)**

| Field | Value |
|---|---|
| `first_name`, `last_name`, `email`, `phone`, `job_title`, `hire_date` (`YYYY-MM-DD`), `status` | strings |
| `department` | department id, or empty string for "none" |
| `emergency_contacts` | a **JSON string**, e.g. `[{"name":"...","relationship":"...","phone":"..."}]` |
| `avatar` | a file (only sent when a new image was chosen) |

**LeaveRequest**

```json
{
  "id": 7,
  "employee": 3,
  "employee_name": "Evan Stone",
  "leave_type": "SICK",
  "start_date": "2026-11-12",
  "end_date": "2026-11-13",
  "days": 2,
  "reason": "Scheduled minor surgery and recovery.",
  "status": "PENDING",
  "review_note": "",
  "reviewed_by_name": null,
  "reviewed_at": null,
  "created_at": "2026-11-02T09:15:00Z"
}
```

`leave_type`: `ANNUAL`, `SICK`, `UNPAID`, `OTHER`. `status`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.

**Activity**

```json
{ "id": 31, "actor_name": "Harper Reed", "verb": "updated", "target_type": "employee", "target_id": 14, "description": "Changed Amara Okafor's status to On leave", "created_at": "2026-11-02T10:01:00Z" }
```

**DashboardStats**

```json
{
  "total_employees": 46,
  "active_employees": 37,
  "inactive_employees": 5,
  "on_leave_employees": 4,
  "total_departments": 6,
  "pending_leaves": 12,
  "by_department": [{ "name": "Engineering", "count": 9 }],
  "by_status": [{ "status": "ACTIVE", "count": 37 }, { "status": "INACTIVE", "count": 5 }, { "status": "ON_LEAVE", "count": 4 }],
  "hires_by_month": [{ "month": "2025-12", "count": 2 }, { "month": "2026-01", "count": 1 }],
  "recent_activity": []
}
```

**Validation error shapes (DRF)**, which you will map onto form fields in React:

```json
{ "email": ["employee with this email already exists."] }
```

```json
{ "non_field_errors": ["Your account is not linked to an employee profile."] }
```

```json
{ "detail": "You do not have permission to perform this action." }
```

### 2.12 Troubleshooting

> ⚠️ **`django.db.utils.OperationalError: connection refused`**: PostgreSQL isn't running, or the `.env` credentials are wrong.

> ⚠️ **`ValueError: Dependency on app with no migrations: accounts`**: run `makemigrations accounts hr` before `migrate`.

> ⚠️ **"Related model 'accounts.user' cannot be resolved"** after you already migrated with the default user: drop and recreate the database, then migrate again. This is why `AUTH_USER_MODEL` must be set first.

> ⚠️ **CORS errors in the browser later**: check that `CORS_ALLOWED_ORIGINS` exactly matches the Vite URL, including the port and no trailing slash.

### 2.13 Checkpoint

You have a running API at `http://localhost:8000/api/` with demo data, and you know where the API contract table is ([§2.11](#api-contract)). Everything from here on is React.

---

<a id="phase-3"></a>

## Phase 3: Creating the React Project with Vite and How React Works

### 3.1 Learning objectives

- Scaffold a React app with Vite and understand every generated file.
- Understand what React actually does: components, rendering, the virtual DOM, reconciliation and commits.
- Understand JSX, ES modules, `createRoot` and Strict Mode.

### 3.2 Create the project

Open a **second terminal** in the `peopledesk/` folder (leave Django running in the first):

```bash
npm create vite@latest frontend -- --template react
```

If the CLI asks extra questions (for example whether to install and start now), answer **No**. You'll install manually so you can see each step.

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Open `http://localhost:5173`. You'll see the Vite + React starter with a counter.

> **Versions used in this guide.** React 19, Vite 7 or newer, Tailwind CSS 4, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Zustand 5, Recharts 3, Vitest 3 or newer, MSW 2. Install commands pin the **major** version where APIs differ between majors (for example `zod@4`), so the code in this guide keeps working.

### 3.3 Tour of the generated project

```text
frontend/
├── index.html          ← the single HTML page. Vite injects your JS here.
├── package.json        ← dependencies + scripts (dev, build, preview, lint)
├── vite.config.js      ← Vite configuration (plugins, aliases, dev server)
├── eslint.config.js    ← ESLint "flat config", including React Hooks rules
├── public/             ← static files served as-is (favicon)
└── src/
    ├── main.jsx        ← entry point: mounts React into <div id="root">
    ├── App.jsx         ← the root component
    ├── App.css / index.css
    └── assets/
```

**`package.json` scripts**

| Script | What it does |
|---|---|
| `npm run dev` | Starts the dev server with Hot Module Replacement (HMR): edits appear instantly without losing state. |
| `npm run build` | Produces an optimised production bundle in `dist/`. |
| `npm run preview` | Serves `dist/` locally so you can test the production build. |
| `npm run lint` | Runs ESLint. |

**Why Vite?** In development Vite serves your source files as native ES modules and only transforms files the browser requests, so startup is near-instant. For production it bundles and optimises everything. Create React App, the old default, is deprecated. Don't use it.

### 3.4 How React works (the mental model)

React is a library for building user interfaces out of **components**: functions that take inputs (**props**) and return a description of what the UI should look like.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

The central idea:

> **UI = f(state).** You describe *what* the UI should look like for the current data, and React works out *how* to update the browser DOM to match.

This is **declarative** programming. Compare the imperative way: "find the element, change its text, add a class, remove a child…". With React you never touch the DOM directly for normal UI work.

**Rendering in three steps**

1. **Trigger**: a render happens on the initial mount, or when state changes (yours or a parent's).
2. **Render**: React calls your component functions. They return React elements, which are plain JavaScript objects describing UI (`{ type: "h1", props: { children: "Hello, Ada" } }`). This tree of objects is often called the **virtual DOM**.
3. **Commit**: React compares the new element tree with the previous one (**reconciliation**) and applies the **minimal** set of changes to the real DOM.

**Reconciliation rules you must know**

- If an element's **type** changes (`<div>` → `<section>`, or `<EmployeeTable>` → `<EmptyState>`), React destroys the old subtree, including its state, and builds a new one.
- If the type is the same, React keeps the DOM node and component state and only updates the changed props.
- In lists, React matches children by their **`key`**. Keys are how React knows "this row is the same employee as before". You'll see what happens when keys are wrong in Phase 5.

> 💡 **Interview question: "What is the virtual DOM and is it fast?"** It's an in-memory tree of plain objects that describes the UI. React diffs the new tree against the old one and commits only the differences. It isn't "faster than the DOM". Its value is that you write declarative code and React batches and minimises the real DOM work for you.

> 💡 **Interview question: "Does a re-render mean the DOM changed?"** No. A re-render means React called your component function again. The DOM is touched only if the output differs.

### 3.5 JSX

JSX is syntax that compiles to function calls. This:

```jsx
<Button variant="primary" onClick={save}>Save</Button>
```

becomes roughly this:

```js
jsx(Button, { variant: "primary", onClick: save, children: "Save" });
```

JSX rules:

| Rule | Example |
|---|---|
| Return **one** root element (or a Fragment `<>…</>`) | `return <><Header /><Main /></>;` |
| Use `className` instead of `class`, and `htmlFor` instead of `for` | `<label htmlFor="email" className="text-sm">` |
| Attributes are camelCase | `onClick`, `tabIndex`, `aria-label` (aria/data stay dashed) |
| Embed **expressions** with `{}` | `{employee.firstName}`, `{count * 2}`, `{isAdmin && <AdminBadge />}` |
| Statements (`if`, `for`) are not allowed inside JSX | Use a ternary, `&&`, or compute the value before `return` |
| Close every tag | `<img />`, `<input />` |
| Components start with a capital letter | `<employeeCard />` would be treated as an HTML tag |

### 3.6 ES modules in one minute

Every file is a module. You **export** what other files can use and **import** what you need:

```js
// format.js
export function formatDate(value) { /* ... */ }   // named export
export default function App() { /* ... */ }        // default export (one per file)

// elsewhere
import App from "./App.jsx";                // default import: you choose the name
import { formatDate } from "./format.js";   // named import: must match the name
```

**Convention used in this guide:** every component, hook and utility uses a **named export**, except **route pages**, which use `export default` because route-level lazy loading (`React.lazy`) expects a default export. You'll see why in Phase 18.

### 3.7 Clean up the template

Delete the files you won't use.

**Windows PowerShell:**

```bash
Remove-Item src/App.css, src/assets -Recurse
```

**macOS/Linux:**

```bash
rm -rf src/App.css src/assets
```

Replace **`src/main.jsx`**. This file will not change again for the rest of the course:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// createRoot attaches React to the <div id="root"> in index.html.
// Everything React renders lives inside this root.
createRoot(document.getElementById("root")).render(
  // StrictMode is development-only: it double-invokes component bodies and
  // runs effects mount → unmount → mount to surface impure code and missing cleanups.
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Replace **`src/App.jsx`** temporarily:

```jsx
import { useState } from "react";

export default function App() {
  const [clicks, setClicks] = useState(0);

  // This runs on every render. With StrictMode you will see it twice per render in development.
  console.log("App rendered with clicks =", clicks);

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>PeopleDesk</h1>
      <p>React re-renders this component every time state changes.</p>
      <button type="button" onClick={() => setClicks(clicks + 1)}>
        Clicked {clicks} times
      </button>
    </main>
  );
}
```

Empty **`src/index.css`** for now. You'll fill it in Phase 4.

Create **`frontend/.env`**. Vite only exposes variables that start with `VITE_` to your code:

```ini
VITE_API_URL=http://localhost:8000/api
```

Also create **`frontend/.env.example`** with the same content. Commit the example file, never the real `.env`. Add `.env` to `frontend/.gitignore`. The Vite template's `.gitignore` already ignores `node_modules` and `dist`, so append this line:

```text
.env
```

### 3.8 How this code works

- `useState(0)` gives the component a piece of memory that survives between renders. Calling `setClicks` **schedules** a re-render with the new value.
- Open the console and click the button. Each click logs the render message twice in development: that's Strict Mode intentionally calling your component twice to catch side effects in render. Production builds call it once.
- Open React DevTools → **Components**, select `App`, and watch the hook value change.

### 3.9 Exercises

1. Add a second button that resets `clicks` to `0`.
2. Render `<p>Double digits!</p>` only when `clicks >= 10` (hint: `{clicks >= 10 && <p>…</p>}`).
3. Temporarily remove `<StrictMode>` and confirm the log appears once per click. Then put it back.

### 3.10 Common mistakes

> ⚠️ **Calling the setter during render** (`setClicks(clicks + 1)` directly in the component body) causes an infinite render loop. State updates belong in event handlers or effects.

> ⚠️ **`onClick={setClicks(clicks + 1)}`** *calls* the function during render. Pass a function instead: `onClick={() => setClicks(clicks + 1)}`.

> ⚠️ **Environment variable is `undefined`**: it must start with `VITE_`, and you must restart `npm run dev` after editing `.env`.

### 3.11 Checkpoint

You can explain the trigger → render → commit cycle, what reconciliation and keys are for, why Strict Mode double-renders, and the difference between named and default exports.

---

<a id="phase-4"></a>

## Phase 4: Configuring Tailwind CSS v4 and Design Tokens

### 4.1 Learning objectives

- Install Tailwind CSS v4 with its official Vite plugin.
- Configure an `@` import alias.
- Define semantic **design tokens** that also power dark mode.

### 4.2 Concepts

Tailwind is a utility-first CSS framework: you style elements with small single-purpose classes (`flex`, `px-4`, `text-sm`). In a component-based app, **the component is the reusable unit of styling**. You write `<Button variant="primary">` once and reuse it everywhere, instead of creating CSS classes like `.btn-primary`.

Tailwind v4 is configured **in CSS** with `@import "tailwindcss"` and `@theme`. There's no `tailwind.config.js` or PostCSS setup when you use the Vite plugin.

### 4.3 Install

```bash
npm install tailwindcss@4 @tailwindcss/vite@4
```

### 4.4 Configure Vite

Replace **`vite.config.js`**:

```js
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/components/ui/Button" instead of "../../../components/ui/Button"
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: { port: 5173 },
});
```

Create **`jsconfig.json`** so VS Code understands the alias (autocomplete and go-to-definition):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 4.5 Global styles and design tokens

Replace **`src/index.css`**:

```css
@import "tailwindcss";

/* Class-based dark mode: when <html> has class="dark", every dark: variant applies. */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /*
   * Semantic colour tokens. Each one becomes a utility: bg-canvas, bg-surface,
   * border-line, text-fg, text-fg-muted... Components use these names instead of
   * raw colours, so dark mode is handled by swapping the variables below.
   */
  --color-canvas: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f5f9;
  --color-line: #e2e8f0;
  --color-fg: #0f172a;
  --color-fg-muted: #64748b;
}

@layer base {
  /* Dark theme: same token names, different values. */
  .dark {
    --color-canvas: #020617;
    --color-surface: #0f172a;
    --color-surface-muted: #1e293b;
    --color-line: #1e293b;
    --color-fg: #f1f5f9;
    --color-fg-muted: #94a3b8;
  }

  html {
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-canvas text-fg;
  }
}
```

Replace **`index.html`** to load the Inter font and set the title:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>PeopleDesk</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Restart the dev server (`Ctrl+C`, then `npm run dev`) because `vite.config.js` changed.

Quick test: in `App.jsx`, change the `<h1>` to `<h1 className="text-3xl font-bold text-indigo-600">PeopleDesk</h1>`. It should turn large and indigo.

### 4.6 How it works

- `@tailwindcss/vite` scans your source files for class names and generates only the CSS you use.
- `@theme` variables create both CSS custom properties **and** utilities. `--color-surface` gives you `bg-surface`, `text-surface`, `border-surface`, and so on.
- Because utilities read `var(--color-surface)`, redefining the variable under `.dark` re-themes the whole app without writing `dark:` on every element. You'll still use `dark:` for one-off tweaks such as badge colours.

### 4.7 Reusable styling patterns you'll use

| Pattern | Where |
|---|---|
| **Component variants**: a map from `variant` to classes | `Button`, `Badge` |
| **`cn()` helper**: combine conditional class names | Everywhere |
| **Semantic tokens** | `bg-surface`, `border-line`, `text-fg-muted` |
| **Responsive prefixes**: mobile first, `sm:` `md:` `lg:` apply at that width and up | Layout, grids, tables |

### 4.8 Common mistakes

> ⚠️ **Building class names dynamically**, e.g. `` `bg-${color}-600` ``. Tailwind can't see that string when it scans your files, so the class is never generated. Map to **complete** class names: `{ green: "bg-green-600", red: "bg-red-600" }`.

> ⚠️ **Following Tailwind v3 tutorials** (`tailwind.config.js`, `npx tailwindcss init`, `@tailwind base;`). v4 doesn't use those.

### 4.9 Checkpoint

Tailwind classes work, the `@` alias resolves, and you understand why the semantic tokens make dark mode cheap.

---

<a id="phase-5"></a>

## Phase 5: React Fundamentals Through a Reusable UI Kit

### 5.1 Learning objectives

By building the UI kit PeopleDesk will use everywhere, you'll learn:

- Function components, props, destructuring and default values
- `children` and component composition
- One-way data flow and lifting state up
- `useState`, event handling, and controlled vs uncontrolled inputs
- Conditional rendering, lists, keys and Fragments
- The JavaScript you use in React every day: spread/rest, array methods, immutability, optional chaining, nullish coalescing, template literals

### 5.2 Install the icon library

```bash
npm install lucide-react
```

Lucide icons are React components: `<Search className="h-4 w-4" />`. They're tree-shaken, so you only ship the icons you import.

### 5.3 The `cn` helper

Create **`src/lib/cn.js`**:

```js
/**
 * Joins class names, skipping falsy values, so you can write:
 *   cn("px-4", isActive && "bg-indigo-600", className)
 * `.flat()` also lets callers pass arrays of classes.
 */
export function cn(...classes) {
  return classes.flat().filter(Boolean).join(" ");
}
```

> **JS concept: rest parameters.** `...classes` collects all the arguments into an array. `filter(Boolean)` is a common idiom for removing `false`, `null`, `undefined` and `""`.

### 5.4 Shared constants and formatters

Create **`src/lib/constants.js`**. Naming values here avoids "magic strings" scattered across the app, and the values match the backend exactly:

```js
export const APP_NAME = "PeopleDesk";

export const ROLES = Object.freeze({ ADMIN: "ADMIN", HR: "HR", EMPLOYEE: "EMPLOYEE" });
export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.HR, label: "HR" },
  { value: ROLES.EMPLOYEE, label: "Employee" },
];

export const EMPLOYEE_STATUS = Object.freeze({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", ON_LEAVE: "ON_LEAVE" });
export const EMPLOYEE_STATUS_OPTIONS = [
  { value: EMPLOYEE_STATUS.ACTIVE, label: "Active" },
  { value: EMPLOYEE_STATUS.INACTIVE, label: "Inactive" },
  { value: EMPLOYEE_STATUS.ON_LEAVE, label: "On leave" },
];

export const LEAVE_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});
export const LEAVE_STATUS_OPTIONS = [
  { value: LEAVE_STATUS.PENDING, label: "Pending" },
  { value: LEAVE_STATUS.APPROVED, label: "Approved" },
  { value: LEAVE_STATUS.REJECTED, label: "Rejected" },
  { value: LEAVE_STATUS.CANCELLED, label: "Cancelled" },
];

export const LEAVE_TYPE_OPTIONS = [
  { value: "ANNUAL", label: "Annual" },
  { value: "SICK", label: "Sick" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "OTHER", label: "Other" },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 400;
export const TOAST_DURATION_MS = 4000;
export const DASHBOARD_REFRESH_MS = 60_000;

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // matches the backend limit
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_EMERGENCY_CONTACTS = 5;

/** Finds the human label for a value in an options array, falling back to the raw value. */
export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}
```

> **JS concepts: optional chaining and nullish coalescing.** `options.find(...)?.label` returns `undefined` instead of throwing when nothing is found. `?? value` falls back **only** for `null`/`undefined`, unlike `||`, which also replaces `0` and `""`.

Create **`src/lib/format.js`**:

```js
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses API dates safely. `new Date("2026-03-01")` is treated as UTC midnight,
 * which shows as Feb 28 for users west of UTC. Date-only strings are therefore
 * parsed as LOCAL dates.
 */
export function parseDate(value) {
  if (!value) return null;
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });

export function formatDate(value) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "—";
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const RELATIVE_UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 hours ago", "yesterday", "in 2 days". */
export function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
}

/** Today as YYYY-MM-DD in the user's local time zone (what <input type="date"> uses). */
export function toISODate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inclusive number of days between two YYYY-MM-DD strings, or 0 if invalid. */
export function countDays(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate || endDate < startDate) return 0;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((endDate - startDate) / MS_PER_DAY) + 1;
}

/** "Amara Okafor" -> "AO" */
export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
```

> **JS concepts: destructuring and template literals.** `const [year, month, day] = ...` unpacks an array into variables. `` `${date.getFullYear()}-${month}` `` builds strings without `+`.

### 5.5 Components and props: `Spinner` and `Button`

A **component** is a function that returns JSX. **Props** are its arguments, passed as one object that you usually destructure.

Create **`src/components/ui/Spinner.jsx`**:

```jsx
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }) {
  return <LoaderCircle className={cn("h-5 w-5 animate-spin", className)} aria-hidden="true" />;
}
```

Create **`src/components/ui/buttonStyles.js`**. It's a separate file so links (`<Link>`) can look like buttons too:

```js
import { cn } from "@/lib/cn";

// Complete class strings (never built dynamically) so Tailwind can find them.
const VARIANTS = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
  secondary: "border border-line bg-surface text-fg shadow-sm hover:bg-surface-muted",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-500",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
};

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
    "disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
```

Create **`src/components/ui/Button.jsx`**:

```jsx
import { buttonClasses } from "./buttonStyles";
import { Spinner } from "./Spinner";

/**
 * The app's only button. Variants keep styling consistent; `...props` forwards
 * everything else (onClick, aria-*, form, ref...) to the native <button>.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button", // default to "button" so buttons inside forms don't submit by accident
  isLoading = false,
  leftIcon: LeftIcon, // rename on destructure: components must be capitalised to render
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {isLoading ? <Spinner className="h-4 w-4" /> : LeftIcon && <LeftIcon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
```

**How it works**

- **Default parameter values** (`variant = "primary"`) make most props optional.
- **Rest/spread**: `...props` collects every prop you didn't name, and `{...props}` spreads them onto `<button>`. This keeps `Button` a drop-in replacement for the native element.
- **Conditional rendering**: `isLoading ? <Spinner /> : LeftIcon && <LeftIcon />` shows a spinner while loading, otherwise the icon if one was given.
- **React 19 note:** `ref` is now an ordinary prop for function components, so `<Button ref={myRef}>` works through `...props` without the old `forwardRef` wrapper.

> ⚠️ **`{count && <Badge />}` renders `0`** when `count` is `0`, because `0` is a renderable value. Use `{count > 0 && <Badge />}`.

### 5.6 More UI primitives

Create **`src/components/ui/Badge.jsx`**:

```jsx
import { cn } from "@/lib/cn";

const TONES = {
  gray: "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300",
  green: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400",
  yellow: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300",
};

export function Badge({ tone = "gray", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

Create **`src/components/ui/Card.jsx`**. This is **composition with `children`**: `Card` doesn't know or care what's inside it.

```jsx
import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

/** Optional header slot. `actions` is any JSX, e.g. buttons. */
export function CardHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

Create **`src/components/ui/Avatar.jsx`**. It's your first component with **state**:

```jsx
import { useState } from "react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

export function Avatar({ src, name = "", size = "md", className }) {
  // Remember WHICH src failed rather than a boolean. When `src` changes, the
  // comparison below is automatically false again, with no effect needed to "reset" state.
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <span aria-hidden="true">{initials(name) || "?"}</span>
      )}
    </span>
  );
}
```

> 💡 **Interview question: "What's derived state and why avoid duplicating it?"** If a value can be computed from props or other state, compute it during render (`showImage` here) instead of storing it and syncing it with an effect. Duplicated state drifts out of sync.

Create **`src/components/ui/Skeleton.jsx`**:

```jsx
import { cn } from "@/lib/cn";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-muted", className)} aria-hidden="true" />;
}

/** Placeholder rows shaped like a table, shown while the first page loads. */
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          {Array.from({ length: columns - 1 }, (_, col) => (
            <Skeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

> **Keys on static placeholders.** Using the index as a key is fine here, because these rows never reorder, get inserted or hold state.

Create **`src/components/ui/EmptyState.jsx`**:

```jsx
import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-surface-muted p-3">
        <Icon className="h-6 w-6 text-fg-muted" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
```

Create **`src/components/ui/ErrorState.jsx`**:

```jsx
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-red-50 p-3 dark:bg-red-500/10">
        <TriangleAlert className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-fg-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-5" leftIcon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
```

### 5.7 The Fundamentals Lab: state, events, lists, keys and lifting state

Now you'll use these primitives in a **temporary lab** with sample data. You'll delete the lab in Phase 7 when real pages arrive. It exists to teach the fundamentals without network code getting in the way.

Create **`src/lab/sampleEmployees.js`**:

```js
export const SAMPLE_EMPLOYEES = [
  { id: 1, name: "Amara Okafor", title: "Senior Engineer", department: "Engineering", status: "ACTIVE" },
  { id: 2, name: "Liam Novak", title: "Recruiter", department: "Human Resources", status: "ACTIVE" },
  { id: 3, name: "Sofia Garcia", title: "Financial Analyst", department: "Finance", status: "ON_LEAVE" },
  { id: 4, name: "Kofi Mensah", title: "Account Executive", department: "Sales", status: "INACTIVE" },
  { id: 5, name: "Priya Patel", title: "Designer", department: "Marketing", status: "ACTIVE" },
  { id: 6, name: "Diego Silva", title: "DevOps Engineer", department: "Engineering", status: "ACTIVE" },
];
```

Create **`src/lab/StatusFilter.jsx`**. This component has **no state of its own**. Its parent owns the value and passes it down with a callback. That's **lifting state up**.

```jsx
import { cn } from "@/lib/cn";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";

const ALL = { value: "ALL", label: "All" };

export function StatusFilter({ value, onChange, counts }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="group" aria-label="Filter by status">
      {[ALL, ...EMPLOYEE_STATUS_OPTIONS].map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)} // pass the clicked value UP to the parent
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            value === option.value ? "bg-indigo-600 text-white" : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
          {option.value !== "ALL" && <span className="ml-1 opacity-70">({counts[option.value] ?? 0})</span>}
        </button>
      ))}
    </div>
  );
}
```

Create **`src/lab/EmployeeListItem.jsx`**:

```jsx
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { EMPLOYEE_STATUS_OPTIONS, labelFor } from "@/lib/constants";

const STATUS_TONE = { ACTIVE: "green", INACTIVE: "gray", ON_LEAVE: "yellow" };

export function EmployeeListItem({ employee, isSelected, onSelect }) {
  // Destructuring an object prop for readability.
  const { name, title, department, status } = employee;

  return (
    <li
      className={cn(
        "flex items-center gap-4 rounded-lg border px-4 py-3",
        isSelected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-line bg-surface",
      )}
    >
      <Avatar name={name} />
      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect(employee.id)}>
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-sm text-fg-muted">
          {title} · {department}
        </p>
      </button>
      <Badge tone={STATUS_TONE[status]}>{labelFor(EMPLOYEE_STATUS_OPTIONS, status)}</Badge>
      {/* UNCONTROLLED input: the DOM owns its value. It's here for the key experiment below. */}
      <input
        aria-label={`Private note for ${name}`}
        placeholder="Note…"
        className="hidden w-28 rounded-md border border-line bg-surface px-2 py-1 text-sm sm:block"
      />
    </li>
  );
}
```

Create **`src/lab/FundamentalsLab.jsx`**:

```jsx
import { Fragment, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";
import { EmployeeListItem } from "./EmployeeListItem";
import { SAMPLE_EMPLOYEES } from "./sampleEmployees";
import { StatusFilter } from "./StatusFilter";

export function FundamentalsLab() {
  // --- State: the minimal data that changes over time ---
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState([]);

  // --- Derived data: computed on every render, never stored in state ---
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEmployees = [...SAMPLE_EMPLOYEES] // copy first: .sort() mutates in place
    .filter((employee) => status === "ALL" || employee.status === status)
    .filter((employee) => employee.name.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => (sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  // reduce: fold the array into an object like { ACTIVE: 4, ON_LEAVE: 1, INACTIVE: 1 }
  const countsByStatus = SAMPLE_EMPLOYEES.reduce(
    (counts, employee) => ({ ...counts, [employee.status]: (counts[employee.status] ?? 0) + 1 }),
    {},
  );
  const selectedEmployee = SAMPLE_EMPLOYEES.find((employee) => employee.id === selectedId);
  const anyoneOnLeave = SAMPLE_EMPLOYEES.some((employee) => employee.status === "ON_LEAVE");
  const everyoneHasTitle = SAMPLE_EMPLOYEES.every((employee) => Boolean(employee.title));

  // --- Event handlers ---
  function handleNoteSubmit(event) {
    event.preventDefault(); // stop the browser's full-page form submission
    // Uncontrolled form: read values from the DOM at submit time.
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("note") ?? "").trim();
    if (!text) return;
    // Immutable update: create a NEW array. notes.push(...) would not trigger a re-render.
    setNotes((previous) => [...previous, { id: crypto.randomUUID(), text }]);
    event.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader title="Team summary" description="Fragments, reduce, some and every" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-sm sm:grid-cols-4">
          {EMPLOYEE_STATUS_OPTIONS.map((option) => (
            // A keyed Fragment groups <dt>/<dd> pairs without adding a wrapper element.
            <Fragment key={option.value}>
              <dt className="text-fg-muted">{option.label}</dt>
              <dd className="font-semibold">{countsByStatus[option.value] ?? 0}</dd>
            </Fragment>
          ))}
        </dl>
        <p className="px-5 pb-4 text-sm text-fg-muted">
          {anyoneOnLeave ? "Someone is on leave." : "Everyone is in."}{" "}
          {everyoneHasTitle && "Every employee has a job title."}
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Employees"
          description="Controlled input, lifted state and keyed lists"
          actions={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={sortAscending ? ArrowDownAZ : ArrowUpAZ}
              onClick={() => setSortAscending((previous) => !previous)}
            >
              Sort
            </Button>
          }
        />
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search employees</span>
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-fg-muted" aria-hidden="true" />
            {/* CONTROLLED input: React state is the single source of truth for its value. */}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name…"
              className="h-9 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm"
            />
          </label>
          <StatusFilter value={status} onChange={setStatus} counts={countsByStatus} />
        </div>

        {visibleEmployees.length === 0 ? (
          <EmptyState title="No matches" description="Try a different name or status." />
        ) : (
          <ul className="space-y-2 px-5 pb-5">
            {visibleEmployees.map((employee) => (
              // key = a stable, unique id from the data. Try key={index} in exercise 2.
              <EmployeeListItem
                key={employee.id}
                employee={employee}
                isSelected={employee.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </ul>
        )}

        {selectedEmployee && (
          <p className="border-t border-line px-5 py-3 text-sm">
            Selected: <strong>{selectedEmployee.name}</strong>
          </p>
        )}
      </Card>

      <Card>
        <CardHeader title="Quick notes" description="An uncontrolled form read with FormData" />
        <form onSubmit={handleNoteSubmit} className="flex gap-2 px-5 py-4">
          <input
            name="note"
            placeholder="Add a note…"
            className="h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm"
          />
          <Button type="submit">Add</Button>
        </form>
        <ul className="list-disc space-y-1 px-10 pb-5 text-sm">
          {notes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
```

Replace **`src/App.jsx`**:

```jsx
import { FundamentalsLab } from "@/lab/FundamentalsLab";

export default function App() {
  return <FundamentalsLab />;
}
```

### 5.8 How this code works

**One-way data flow.** Data flows **down** through props (`value={status}`), and changes flow **up** through callbacks (`onChange={setStatus}`). `StatusFilter` can't change the parent's state directly. It can only ask by calling `onChange`. That makes data easy to trace: to find where `status` changes, look for `setStatus`.

**Lifting state up.** Both the filter buttons and the list need `status`. So the state lives in their closest common parent, `FundamentalsLab`, and is passed to each child. That's the rule: **put state in the lowest component that every user of that state sits under.**

**Controlled vs uncontrolled.**

| | Controlled (search input) | Uncontrolled (notes form) |
|---|---|---|
| Source of truth | React state | The DOM |
| Read the value | Any time, from state | On submit, via `FormData` or a ref |
| Good for | Live filtering, formatting, validation as you type | Simple forms, file inputs, integrating non-React code |
| Cost | Re-render per keystroke | Less control |

React Hook Form (Phase 10) mostly uses **uncontrolled** inputs under the hood, which is why it's fast.

**Immutability.** React decides whether to re-render by comparing references. `notes.push(x)` mutates the existing array, so the reference doesn't change and React may skip the update. `[...previous, x]` creates a new array. The same goes for objects: `{ ...counts, [key]: value }`. The `[key]` syntax is a **computed property name**.

**Functional updates.** `setSortAscending((previous) => !previous)` computes the next state from the latest value. Use this form whenever the next state depends on the previous one. Phase 6 shows the bug it prevents.

**Event handlers** receive a synthetic event (`event.target.value`, `event.preventDefault()`). Pass a function, not a call: `onClick={() => onSelect(employee.id)}`.

### 5.9 Exercises

1. Add a "Department" filter (a `<select>`) that combines with the status filter.
2. **The key experiment.** Type different notes into the small "Note…" inputs on two rows. Click **Sort**: the notes move with their rows. Now change `key={employee.id}` to the index (`.map((employee, index) => <EmployeeListItem key={index} … />)`) and repeat. The notes stay in place while the names move. React matched rows by position, so each uncontrolled input kept its DOM state while the data around it changed. Revert to `employee.id`.
3. Show a "Clear" button inside the search box only when `query` isn't empty.
4. Make `CardHeader` accept a `children` prop rendered under the description. When would you choose `children` over a named prop like `actions`?

### 5.10 Common mistakes

> ⚠️ **Storing derived data in state** (`const [visible, setVisible] = useState(...)` updated in an effect). Compute it during render instead.

> ⚠️ **Mutating state**: `state.items.push()`, `employee.name = "x"`, or `array.sort()` on state. Always copy first.

> ⚠️ **Keys from `Math.random()`** create a new key every render, so React remounts every item and its state is lost each time.

> ⚠️ **A controlled input without `onChange`** becomes read-only. A `value` that switches between `undefined` and a string triggers the "changing an uncontrolled input to be controlled" warning. Initialise with `""`.

### 5.11 Checkpoint

You can explain props vs state, one-way data flow, lifting state up, controlled vs uncontrolled inputs, why keys must be stable, when to use Fragments, and why state updates must be immutable.

---

<a id="phase-6"></a>

## Phase 6: Hooks in Depth and Reusable Behaviour

### 6.1 Learning objectives

- Master `useState` and `useEffect`: dependencies, cleanup, stale closures, Strict Mode.
- Use `useRef` for DOM access and for mutable values that shouldn't trigger renders.
- Use `useId` for accessible, collision-free ids.
- Get a first look at `useCallback` and `useMemo` (the deep dive is in Phase 18).
- Extract **custom hooks** and build reusable `Modal` (using a **portal**), `ConfirmDialog` and `Dropdown` (using **compound components**) components.

### 6.2 The Rules of Hooks

1. Call hooks **only at the top level** of a component or custom hook. Never inside conditions, loops or after an early `return`.
2. Call hooks **only from React functions** (components or custom hooks whose names start with `use`).

React identifies each hook by its **call order**. If a condition skips a hook on one render, every hook after it receives the wrong state. The ESLint plugin in the Vite template enforces these rules. Keep it on.

### 6.3 `useState` in depth

| | |
|---|---|
| **Problem it solves** | Giving a component memory between renders. |
| **Use it when** | A value changes over time **and** affects what's rendered. |
| **Don't use it when** | The value can be derived from props or state (compute it), or it changes without affecting rendering (use `useRef`). |

Key behaviours:

```jsx
// 1. Updates are SNAPSHOTS. `count` is fixed for the whole render.
function handleClick() {
  setCount(count + 1);
  setCount(count + 1); // still uses the same `count`, so the result is +1, not +2
}

// 2. Functional updates queue correctly.
function handleClickTwice() {
  setCount((c) => c + 1);
  setCount((c) => c + 1); // +2
}

// 3. Lazy initial state: the function runs only on the first render.
const [prefs] = useState(() => JSON.parse(localStorage.getItem("prefs") ?? "{}"));

// 4. React batches multiple updates in one event into a single re-render.
```

### 6.4 `useEffect` in depth

| | |
|---|---|
| **Problem it solves** | Synchronising a component with something **outside React**: browser APIs, timers, subscriptions, the document title, non-React widgets, and (sometimes) network requests. |
| **Use it when** | Something must happen **because the component is on screen** or because certain values changed. |
| **Don't use it when** | You're transforming data for rendering (compute during render), responding to a user event (do it in the event handler), or resetting state when a prop changes (use a `key` or derive the value). |

Anatomy:

```jsx
useEffect(() => {
  // SETUP: runs after React commits to the DOM
  const id = setInterval(tick, 1000);

  // CLEANUP: runs before the next setup and when the component unmounts
  return () => clearInterval(id);
}, [tick]); // DEPENDENCIES: re-run only when these values change
```

| Dependencies | Runs |
|---|---|
| none: `useEffect(fn)` | After **every** render |
| `[]` | Once after mount (cleanup on unmount) |
| `[a, b]` | After mount and whenever `a` or `b` changes (compared with `Object.is`) |

**Strict Mode** mounts every component, immediately unmounts it, then mounts it again, **in development only**. Effects run setup → cleanup → setup. If that breaks your code, for example a duplicated subscription or a double POST, your cleanup is missing or wrong. That's the point: production code must survive remounts too.

**Stale closures.** Every render creates new functions that "close over" that render's values. An effect with missing dependencies keeps using **old** values:

```jsx
// ❌ BUG: the effect captured count = 0 forever. The counter shows 1 and stops.
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []); // eslint warns: missing dependency 'count'

// ✅ FIX: a functional update doesn't need to read `count` at all.
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

> 💡 **Interview question: "How do you handle the lifecycle in function components?"** Effects replace `componentDidMount`, `componentDidUpdate` and `componentWillUnmount`. But think in terms of **synchronisation** ("keep X in sync with Y"), not lifecycle events. Mount = first setup; update = cleanup, then setup with new dependencies; unmount = final cleanup.

> **JS concept: the event loop.** `setTimeout`, `setInterval` and promise callbacks don't run immediately. They're queued and run after the current call stack finishes. Promise callbacks (microtasks) run before timers (macrotasks). That's why the value you log right after `setCount` is still the old one, and why cleanup matters: a queued callback can run after your component is gone.

### 6.5 `useRef` in depth

| | |
|---|---|
| **Problem it solves** | (1) Accessing DOM nodes (focus, measure, scroll). (2) Keeping a mutable value across renders **without** causing a re-render (timer ids, the latest callback, previous values). |
| **Use it when** | You need an escape hatch to the DOM, or a value that rendering doesn't depend on. |
| **Don't use it when** | The value should appear in the UI. Changing `ref.current` doesn't re-render, so the screen goes stale. Also don't read or write `ref.current` **during render**, only in effects and event handlers. |

### 6.6 `useId`

`useId()` returns an id that's unique per component instance and stable across renders, which is perfect for linking `<label htmlFor>` with `<input id>` and `aria-describedby`. Don't use it for list keys.

### 6.7 A first look at `useCallback` and `useMemo`

- `useCallback(fn, deps)` returns the **same function reference** until `deps` change.
- `useMemo(() => value, deps)` returns the **same computed value** until `deps` change.

You need them when a function or object is a **dependency of an effect**, or a prop of a memoised child, and a new reference each render would cause unnecessary work. Everywhere else they're usually noise. Phase 18 measures this properly.

### 6.8 Custom hooks

A **custom hook** is a function starting with `use` that calls other hooks. It shares **stateful logic**, not state: every component that calls `useDisclosure()` gets its own independent `isOpen`.

Create the following files.

**`src/hooks/useLatest.js`**: keeps a ref pointing at the newest value, so long-lived listeners never call a stale callback.

```js
import { useLayoutEffect, useRef } from "react";

/**
 * Returns a ref whose .current is always the latest `value`.
 * Use it when an effect needs to CALL a callback prop without re-subscribing
 * every time the parent passes a new function (e.g. an inline arrow).
 * (React 19.2 adds `useEffectEvent` for the same problem.)
 */
export function useLatest(value) {
  const ref = useRef(value);
  // Update after render but before other effects run, so they see the latest value.
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
```

**`src/hooks/useDisclosure.js`**: open/close state for modals, drawers and menus.

```js
import { useCallback, useMemo, useState } from "react";

export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Stable function identities: safe to pass to memoised children or effect deps.
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
}
```

**`src/hooks/useDebounce.js`**: delays a fast-changing value.

```js
import { useEffect, useState } from "react";

/** Returns `value` only after it has stopped changing for `delay` ms. */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    // Each new keystroke cancels the previous timer. That cleanup IS the debounce.
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
```

**`src/hooks/useDebouncedCallback.js`**: debounces a function call instead of a value. You'll use it to write search terms to the URL.

```js
import { useCallback, useEffect, useRef } from "react";
import { useLatest } from "./useLatest";

export function useDebouncedCallback(callback, delay = 400) {
  const callbackRef = useLatest(callback);
  const timeoutRef = useRef(null); // a timer id: mutable, never rendered → a ref, not state

  // Cancel a pending call if the component unmounts.
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay, callbackRef],
  );
}
```

**`src/hooks/useClickOutside.js`**

```js
import { useEffect } from "react";
import { useLatest } from "./useLatest";

/** Calls `onOutside` when a pointer press happens outside `ref`'s element. */
export function useClickOutside(ref, onOutside, enabled = true) {
  const handlerRef = useLatest(onOutside);

  useEffect(() => {
    if (!enabled) return undefined;
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current(event);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, enabled, handlerRef]);
}
```

**`src/hooks/useMediaQuery.js`**: subscribes to a CSS media query. It uses `useSyncExternalStore`, React's built-in hook for reading **external stores** (browser APIs, third-party state) without tearing.

```js
import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  // getSnapshot is read on every render; getServerSnapshot is a fallback for non-browser rendering.
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
```

**`src/hooks/useOnlineStatus.js`**

```js
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

/** true/false from navigator.onLine, re-rendering when the browser goes on/offline. */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
```

**`src/hooks/useDocumentTitle.js`**

```js
import { useEffect } from "react";
import { APP_NAME } from "@/lib/constants";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
```

**`src/lib/throttle.js`** and **`src/hooks/useScrolled.js`**: **throttling** runs a function at most once per interval. Use it for continuous events (scroll, resize, mousemove) where you want regular updates. **Debouncing** waits until events stop, which suits search inputs.

```js
// src/lib/throttle.js

/**
 * Runs `fn` at most once every `wait` ms, plus one trailing call so the
 * final state is never missed. `.cancel()` clears a pending trailing call.
 */
export function throttle(fn, wait) {
  let lastRun = 0;
  let trailingTimer = null;

  function throttled(...args) {
    const remaining = wait - (Date.now() - lastRun);
    if (remaining <= 0) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
      lastRun = Date.now();
      fn(...args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        lastRun = Date.now();
        trailingTimer = null;
        fn(...args);
      }, remaining);
    }
  }

  throttled.cancel = () => clearTimeout(trailingTimer);
  return throttled;
}
```

```js
// src/hooks/useScrolled.js
import { useEffect, useState } from "react";
import { throttle } from "@/lib/throttle";

const SCROLL_THROTTLE_MS = 100;

/** true once the window has scrolled past `threshold` px. Used for the top bar shadow. */
export function useScrolled(threshold = 4) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > threshold);

  useEffect(() => {
    // Scroll fires dozens of times per second; throttling keeps re-renders cheap.
    const handleScroll = throttle(() => setIsScrolled(window.scrollY > threshold), SCROLL_THROTTLE_MS);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [threshold]);

  return isScrolled;
}
```

> **JS concept: closures.** `throttle` returns a function that remembers `lastRun` and `trailingTimer` between calls, even though `throttle` itself finished running long ago. Hooks are built on the same idea: each render's functions close over that render's values.

### 6.9 A reusable Modal with a portal

A **portal** renders children into a different DOM node (`document.body`) while keeping them in the same **React** tree. Context, state and events still flow as usual. You need it so modals escape parents with `overflow: hidden` or a `z-index`.

Create **`src/components/ui/Modal.jsx`**:

```jsx
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLatest } from "@/hooks/useLatest";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };
const FOCUSABLE =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab cycling inside the dialog. */
function trapFocus(event, container) {
  const items = [...container.querySelectorAll(FOCUSABLE)];
  if (items.length === 0) return;
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Modal({ isOpen, onClose, title, description, footer, size = "md", children }) {
  // All hooks run BEFORE the early `return null` below (Rules of Hooks).
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  // Parents often pass inline arrows (a new function every render). Reading the
  // latest one from a ref means the effect below doesn't re-run on every render,
  // which would otherwise steal focus back to the first input on each keystroke.
  const onCloseRef = useLatest(onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;

    // Move focus into the dialog: first field in the body, or the panel itself.
    (bodyRef.current?.querySelector(FOCUSABLE) ?? panel)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab") trapFocus(event, panel);
    }
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // stop the page scrolling behind the modal

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.(); // give focus back to whatever opened the modal
    };
  }, [isOpen, onCloseRef]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={() => onCloseRef.current()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col rounded-xl border border-line bg-surface shadow-xl outline-none",
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close dialog" onClick={() => onCloseRef.current()}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div ref={bodyRef} className="overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && <div className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
```

Create **`src/components/ui/ConfirmDialog.jsx`**:

```jsx
import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  isLoading = false,
}) {
  // While the request runs, Escape/backdrop must not close the dialog mid-delete.
  const handleClose = isLoading ? () => {} : onClose;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === "danger" && <TriangleAlert className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />}
        <p className="text-sm text-fg-muted">{message}</p>
      </div>
    </Modal>
  );
}
```

### 6.10 A Dropdown built from compound components

**Compound components** are a set of components that work together and share implicit state through context, like `<select>` and `<option>`. Here `DropdownItem` closes its parent menu without the caller wiring anything up. (Context gets a full treatment in Phase 8; this is a preview.)

Create **`src/components/ui/Dropdown.jsx`**:

```jsx
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

// Shares the menu's `close` function with every DropdownItem inside it.
const DropdownContext = createContext(null);

export function Dropdown({ label, triggerContent, triggerVariant = "ghost", triggerSize = "sm", align = "end", children }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useClickOutside(containerRef, close, isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        variant={triggerVariant}
        size={triggerSize}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {triggerContent}
      </Button>
      {isOpen && (
        // React 19: a context object can be rendered directly as its provider.
        <DropdownContext value={close}>
          <div
            id={menuId}
            role="menu"
            className={cn(
              "absolute z-30 mt-2 min-w-48 rounded-lg border border-line bg-surface p-1 shadow-lg",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {children}
          </div>
        </DropdownContext>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, onSelect, tone = "default", children }) {
  const close = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        close?.();
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted",
        tone === "danger" ? "text-red-600 dark:text-red-400" : "text-fg",
      )}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
```

### 6.11 The Hooks Lab

Create **`src/lab/HooksLab.jsx`**:

```jsx
import { useEffect, useId, useRef, useState } from "react";
import { Copy, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function HooksLab() {
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const intervalRef = useRef(null); // holds a timer id; changing it must not re-render
  const searchInputRef = useRef(null); // holds a DOM node
  const searchId = useId();

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isOnline = useOnlineStatus();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();

  useDocumentTitle(`Count ${count}`);

  // Watch the console: in Strict Mode you will see setup → cleanup → setup on mount,
  // then cleanup(old count) → setup(new count) on every change.
  useEffect(() => {
    console.log(`effect: setup for count=${count}`);
    return () => console.log(`effect: cleanup for count=${count}`);
  }, [count]);

  // Clear any running stopwatch if the component unmounts.
  useEffect(() => () => clearInterval(intervalRef.current), []);

  function startStopwatch() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000); // functional update: no stale closure
    setIsRunning(true);
  }

  function stopStopwatch() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader title="useState + useEffect" description={`Online: ${isOnline ? "yes" : "no"} · Desktop: ${isDesktop ? "yes" : "no"}`} />
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <Button onClick={() => setCount((c) => c + 1)}>Count is {count}</Button>
          <span className="text-sm text-fg-muted">Check the browser tab title and the console.</span>
        </div>
      </Card>

      <Card>
        <CardHeader title="useRef" description="A timer id and a DOM node" />
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <span className="w-16 font-mono text-lg">{seconds}s</span>
          <Button onClick={isRunning ? stopStopwatch : startStopwatch} variant="secondary">
            {isRunning ? "Stop" : "Start"}
          </Button>
          <Button variant="ghost" onClick={() => searchInputRef.current?.focus()}>
            Focus the search box
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="useDebounce + useId" />
        <div className="space-y-2 px-5 py-4">
          <label htmlFor={searchId} className="text-sm font-medium">
            Search
          </label>
          <input
            id={searchId}
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
          />
          <p className="text-sm text-fg-muted">
            Typed: <code>{search}</code> · Debounced (500 ms): <code>{debouncedSearch}</code>
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Portal modal, confirm dialog and dropdown" />
        <div className="flex items-center gap-3 px-5 py-4">
          <Button onClick={editModal.open}>Open modal</Button>
          <Dropdown label="Row actions" triggerContent={<EllipsisVertical className="h-4 w-4" />} triggerSize="icon-sm">
            <DropdownItem icon={Pencil} onSelect={editModal.open}>
              Edit
            </DropdownItem>
            <DropdownItem icon={Copy} onSelect={() => console.log("duplicate")}>
              Duplicate
            </DropdownItem>
            <DropdownItem icon={Trash2} tone="danger" onSelect={deleteDialog.open}>
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </Card>

      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit employee"
        description="The first field receives focus; Escape closes; Tab stays inside."
        footer={
          <>
            <Button variant="secondary" onClick={editModal.close}>
              Cancel
            </Button>
            <Button onClick={editModal.close}>Save</Button>
          </>
        }
      >
        <input placeholder="Job title" className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm" />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.close}
        title="Delete employee?"
        message="This permanently removes the employee record."
        confirmLabel="Delete"
      />
    </div>
  );
}
```

Replace **`src/App.jsx`**:

```jsx
import { FundamentalsLab } from "@/lab/FundamentalsLab";
import { HooksLab } from "@/lab/HooksLab";

export default function App() {
  return (
    <>
      <HooksLab />
      <FundamentalsLab />
    </>
  );
}
```

### 6.12 How this code works

- **Modal effect dependencies.** The effect depends on `isOpen` and `onCloseRef`. The ref object never changes identity, so the effect runs only when the modal opens or closes. If `onClose` itself were a dependency, every parent re-render with an inline arrow would re-run the effect and yank focus back to the first input. That's a real bug you'll meet in other codebases.
- **Cleanup restores everything the setup changed**: listener removed, body scroll restored, focus returned. Strict Mode proves the cleanup is correct by running it straight after mount.
- **The portal** puts the dialog's DOM under `<body>`, while React events still bubble through the **React** tree to `HooksLab`.
- **Compound components**: `Dropdown` provides `close` through context, and each `DropdownItem` consumes it. Callers just write markup.
- **`useSyncExternalStore`** is the correct way to read changing browser state (media queries, online status). It's safer than copying the value into `useState` inside an effect.

### 6.13 Exercises

1. Write `usePrevious(value)` that returns the value from the previous render. (Hint: a ref updated in an effect. Think about why you can't read it reliably during render, then compare with the "store previous value in state" pattern from the React docs.)
2. Write `useLocalStorage(key, initialValue)` that reads lazily with `useState(() => …)` and writes in an effect. Wrap the read in `try/catch`.
3. Break the stopwatch on purpose: replace `setSeconds((s) => s + 1)` with `setSeconds(seconds + 1)`. Explain the result using "stale closure".
4. Open the modal and check in the Elements panel that it's rendered as a direct child of `<body>`.

### 6.14 Common mistakes

> ⚠️ **Lying about dependencies** (`// eslint-disable-next-line react-hooks/exhaustive-deps`). Fix the cause instead: move the function inside the effect, use a functional update, or use the latest-ref pattern.

> ⚠️ **Objects or functions created during render as dependencies** (`useEffect(..., [{ page }])`). They're new every render, so the effect runs every render.

> ⚠️ **Using an effect for event-driven logic** ("when the user clicks Save, POST in an effect that watches a `submitted` flag"). Do the work directly in the click handler.

> ⚠️ **Forgetting cleanup**: duplicated listeners, timers that run after unmount, and "Can't perform a state update on an unmounted component"-style bugs.

### 6.15 Checkpoint

You can explain the Rules of Hooks, effect dependencies and cleanup, why Strict Mode double-runs effects, how a stale closure happens and two ways to fix it, the two uses of `useRef`, why a portal is needed for modals, and what a custom hook does and does not share.

---

<a id="phase-7"></a>

## Phase 7: Application Architecture, Layout and Routing

### 7.1 Learning objectives

- Organise a growing React app with a **feature-based folder structure**.
- Build the application shell: a responsive sidebar, a top bar, page headers.
- Learn React Router: `BrowserRouter`, `Routes`, `Route`, nested and layout routes, `Outlet`, index routes, dynamic segments, `NavLink`, `Link`, `useNavigate`, `useParams`, `useLocation`, and 404 pages.
- Add an **error boundary** and a `Suspense` boundary to the layout.

### 7.2 Folder structure: organise by feature

There are two common approaches:

| By type | By feature (used here) |
|---|---|
| `components/`, `hooks/`, `services/`, `pages/` each hold files from every feature | `features/employees/` holds the employee pages, components, API calls, queries and schemas together |
| Fine for small apps | Scales: deleting or changing a feature touches one folder |

PeopleDesk's final structure:

```text
src/
├── app/                 ← app-wide wiring: providers, routes, navigation, query client
├── components/
│   ├── ui/              ← design-system primitives (Button, Card, Modal…) with no business logic
│   ├── form/            ← form field components
│   ├── layout/          ← AppLayout, Sidebar, Topbar, PageHeader…
│   └── feedback/        ← ErrorBoundary, toasts, loaders
├── features/
│   ├── auth/            ← store, API, guards, login page, permissions
│   ├── employees/       ← api.js, queries.js, schemas.js, components/, pages/
│   ├── departments/
│   ├── leaves/
│   ├── dashboard/
│   ├── users/
│   └── settings/
├── hooks/               ← generic hooks (useDebounce, useDisclosure…)
├── lib/                 ← framework-agnostic helpers (cn, format, apiClient, queryKeys)
├── stores/              ← global client-state stores (UI preferences)
├── pages/               ← app-level pages that belong to no feature (404, 403)
└── test/                ← test setup and helpers
```

**Rules of thumb**

- `components/ui` never imports from `features/`. Features import from `components`, never the other way round.
- Features may import from each other sparingly (for example, a department page using an employee hook). If that grows, move the shared code up a level.
- **Container vs presentational components.** A *page* (container) fetches data, holds state and handles events. *Presentational* components (`EmployeeTable`, `StatCard`) receive data through props and render it. Presentational components are easy to reuse and test. This isn't a strict law, since hooks let any component fetch data, but it's a useful default.

### 7.3 Install React Router and remove the labs

```bash
npm install react-router@7
```

React Router v7 ships everything from the single `react-router` package (the separate `react-router-dom` package is no longer needed). This guide uses its **declarative mode**: `<BrowserRouter>`, `<Routes>`, `<Route>`. That's the classic, widely used client-side API and the right fit for a Vite SPA. RR7 also offers a data mode and a framework mode; see Appendix I.

Delete the labs. Their lessons live on in the real components.

**Windows PowerShell:**

```bash
Remove-Item src/lab -Recurse
```

**macOS/Linux:**

```bash
rm -rf src/lab
```

### 7.4 Routing concepts

| Concept | Meaning |
|---|---|
| `<BrowserRouter>` | Keeps the UI in sync with the URL using the History API. Wrap the app once. |
| `<Routes>` / `<Route path element>` | Declares which element renders for which URL. Matching is **ranked**: `employees/new` beats `employees/:employeeId` regardless of order. |
| **Nested routes** | Child `<Route>`s render **inside** their parent's element, wherever the parent renders `<Outlet />`. |
| **Layout route** | A route with an `element` (often no `path`) that wraps children in shared UI such as the sidebar. |
| **Index route** | `<Route index>` renders at the parent's exact path (`/employees`). |
| **Dynamic segment** | `:employeeId` captures part of the URL, read with `useParams()`. |
| `<Link to>` / `<NavLink>` | Client-side navigation with no full page reload. `NavLink` knows whether it's active. |
| `useNavigate()` | Navigate in code: after saving a form, or `navigate(-1)` for "back". |
| `useLocation()` | The current location object: `pathname`, `search`, `state`. |
| `path="*"` | Catch-all, used for 404 pages. |

### 7.5 Shared layout pieces

**`src/components/layout/Logo.jsx`**

```jsx
import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";

export function Logo({ hideTextOnDesktop = false }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Users className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className={cn(hideTextOnDesktop && "lg:sr-only")}>{APP_NAME}</span>
    </span>
  );
}
```

**`src/app/navigation.js`**: navigation is **data**, not hard-coded JSX, so it can be filtered by permission in Phase 10.

```js
import { Building2, CalendarCheck, CalendarDays, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/leaves", label: "My leave", icon: CalendarDays, end: true },
  { to: "/leaves/approvals", label: "Leave approvals", icon: CalendarCheck },
  { to: "/users", label: "Users & roles", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Returns the navigation items for the current user. Phase 10 adds permission filtering. */
export function useNavItems() {
  return NAV_ITEMS;
}
```

**`src/components/layout/Sidebar.jsx`**: a **presentational** component. It owns no state. Its parent decides whether it's collapsed or open on mobile.

```jsx
import { NavLink } from "react-router";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useNavItems } from "@/app/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const items = useNavItems();

  return (
    <>
      {/* Mobile backdrop: only rendered while the drawer is open */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-hidden="true" onClick={onMobileClose} />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-[width,translate] duration-200",
          // Mobile: slide in/out. Desktop: always visible, width depends on collapsed state.
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed && "lg:w-20",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo hideTextOnDesktop={isCollapsed} />
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Close navigation" onClick={onMobileClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end} // without `end`, "/" would be "active" on every page
              onClick={onMobileClose} // close the drawer from the event, not with an effect
              title={isCollapsed ? label : undefined}
              // NavLink accepts a function for className and passes { isActive }.
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                  isCollapsed && "lg:justify-center",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn(isCollapsed && "lg:sr-only")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-line p-3 lg:block">
          <Button
            variant="ghost"
            className={cn("w-full", isCollapsed ? "justify-center" : "justify-start")}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
```

**`src/components/layout/Topbar.jsx`** (version 1; it grows in Phases 8 and 10):

```jsx
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";

export function Topbar({ onOpenMobileNav }) {
  const isScrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6 lg:px-8",
        isScrolled && "shadow-sm",
      )}
    >
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
    </header>
  );
}
```

**`src/components/layout/PageHeader.jsx`**

```jsx
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function PageHeader({ title, description, actions, backTo, backLabel = "Back" }) {
  useDocumentTitle(title); // every page with a header gets a matching browser tab title

  return (
    <div className="mb-6">
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

**`src/components/feedback/Loaders.jsx`**

```jsx
import { Spinner } from "@/components/ui/Spinner";

/** Shown inside the layout while a lazy page chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <Spinner className="h-6 w-6 text-indigo-600" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

/** Covers the whole screen, e.g. while the session is restored on startup. */
export function FullPageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas" role="status">
      <Spinner className="h-8 w-8 text-indigo-600" />
      <p className="text-sm text-fg-muted">{label}</p>
    </div>
  );
}
```

**`src/components/feedback/ErrorBoundary.jsx`**: the one place modern React still needs a **class component**. Function components can't yet catch render errors.

```jsx
import { Component } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Catches errors thrown while RENDERING its children and shows a fallback
 * instead of a blank white screen. It does NOT catch errors in event handlers,
 * async code (promises, timeouts) or the boundary itself.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  // Render phase: switch to the fallback UI.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Commit phase: the place to report errors (Sentry, logging endpoint...).
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  // When `resetKey` changes (e.g. the user navigates elsewhere), clear the error.
  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });

    return (
      <Card>
        <ErrorState
          title="This page crashed"
          message={import.meta.env.DEV ? error.message : "An unexpected error occurred. Try again or go back."}
          onRetry={this.reset}
        />
      </Card>
    );
  }
}
```

**`src/components/layout/OfflineBanner.jsx`**

```jsx
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      You are offline. Changes will fail until your connection returns.
    </div>
  );
}
```

**`src/components/layout/AppLayout.jsx`** (version 1). This is **lifting state up** in practice: both the sidebar (its width) and the content area (its left padding) depend on `isSidebarCollapsed`, so the state lives in their parent.

```jsx
import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { PageLoader } from "@/components/feedback/Loaders";
import { cn } from "@/lib/cn";
import { OfflineBanner } from "./OfflineBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false); // local UI state: nobody else needs it
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <OfflineBanner />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* resetKey: a crash on one page is cleared when you navigate to another */}
            <ErrorBoundary resetKey={location.pathname}>
              {/* Suspense shows PageLoader while a lazy page loads (Phase 18) */}
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 7.6 App-level pages: 404 and 403

**`src/pages/NotFoundPage.jsx`**: shows `useLocation` and `useNavigate` in action.

```jsx
import { Link, useLocation, useNavigate } from "react-router";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle("Page not found");

  return (
    <Card>
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description={`Nothing lives at ${location.pathname}.`}
        action={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Link to="/" className={buttonClasses()}>
              Dashboard
            </Link>
          </div>
        }
      />
    </Card>
  );
}
```

**`src/pages/ForbiddenPage.jsx`**

```jsx
import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ForbiddenPage() {
  useDocumentTitle("Access denied");

  return (
    <Card>
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="Ask an administrator if you think you should."
        action={
          <Link to="/" className={buttonClasses({ variant: "secondary" })}>
            Back to dashboard
          </Link>
        }
      />
    </Card>
  );
}
```

### 7.7 Placeholder feature pages

Each page below is replaced with its real implementation in a later phase. They let you build and test all of the navigation now. The detail pages already read their **dynamic route parameter** with `useParams`.

**`src/features/dashboard/pages/DashboardPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return <PageHeader title="Dashboard" description="Built in Phase 15." />;
}
```

**`src/features/employees/pages/EmployeesPage.jsx`**

```jsx
import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeesPage() {
  return (
    <PageHeader
      title="Employees"
      description="Built in Phase 11."
      actions={<Link to="/employees/42" className="text-sm text-indigo-600 underline">Open employee 42</Link>}
    />
  );
}
```

**`src/features/employees/pages/EmployeeDetailPage.jsx`**

```jsx
import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeDetailPage() {
  // The name matches the route segment ":employeeId". Params are always strings.
  const { employeeId } = useParams();
  return <PageHeader title={`Employee #${employeeId}`} description="Built in Phase 12." backTo="/employees" backLabel="Employees" />;
}
```

**`src/features/employees/pages/EmployeeCreatePage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeCreatePage() {
  return <PageHeader title="Add employee" description="Built in Phase 12." backTo="/employees" backLabel="Employees" />;
}
```

**`src/features/employees/pages/EmployeeEditPage.jsx`**

```jsx
import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeEditPage() {
  const { employeeId } = useParams();
  return <PageHeader title={`Edit employee #${employeeId}`} description="Built in Phase 12." backTo={`/employees/${employeeId}`} />;
}
```

**`src/features/departments/pages/DepartmentsPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function DepartmentsPage() {
  return <PageHeader title="Departments" description="Built in Phase 13." />;
}
```

**`src/features/departments/pages/DepartmentDetailPage.jsx`**

```jsx
import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  return <PageHeader title={`Department #${departmentId}`} description="Built in Phase 13." backTo="/departments" backLabel="Departments" />;
}
```

**`src/features/leaves/pages/MyLeavesPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function MyLeavesPage() {
  return <PageHeader title="My leave" description="Built in Phase 14." />;
}
```

**`src/features/leaves/pages/LeaveApprovalsPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function LeaveApprovalsPage() {
  return <PageHeader title="Leave approvals" description="Built in Phase 14." />;
}
```

**`src/features/users/pages/UsersPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function UsersPage() {
  return <PageHeader title="Users & roles" description="Built in Phase 16." />;
}
```

**`src/features/settings/pages/SettingsPage.jsx`**

```jsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return <PageHeader title="Settings" description="Built in Phase 17." />;
}
```

### 7.8 Routes, providers and App

**`src/app/AppRoutes.jsx`** (version 1):

```jsx
import { Route, Routes } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import DepartmentDetailPage from "@/features/departments/pages/DepartmentDetailPage";
import DepartmentsPage from "@/features/departments/pages/DepartmentsPage";
import EmployeeCreatePage from "@/features/employees/pages/EmployeeCreatePage";
import EmployeeDetailPage from "@/features/employees/pages/EmployeeDetailPage";
import EmployeeEditPage from "@/features/employees/pages/EmployeeEditPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import LeaveApprovalsPage from "@/features/leaves/pages/LeaveApprovalsPage";
import MyLeavesPage from "@/features/leaves/pages/MyLeavesPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import NotFoundPage from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Layout route: AppLayout renders the shell and an <Outlet /> for the matched child. */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="employees">
          <Route index element={<EmployeesPage />} />
          <Route path="new" element={<EmployeeCreatePage />} />
          <Route path=":employeeId" element={<EmployeeDetailPage />} />
          <Route path=":employeeId/edit" element={<EmployeeEditPage />} />
        </Route>

        <Route path="departments">
          <Route index element={<DepartmentsPage />} />
          <Route path=":departmentId" element={<DepartmentDetailPage />} />
        </Route>

        <Route path="leaves">
          <Route index element={<MyLeavesPage />} />
          <Route path="approvals" element={<LeaveApprovalsPage />} />
        </Route>

        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Catch-all inside the layout, so the 404 keeps the sidebar */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

**`src/app/AppProviders.jsx`** (version 1). One component composes every provider, so `App` stays tidy as more are added:

```jsx
import { BrowserRouter } from "react-router";

export function AppProviders({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
```

Replace **`src/App.jsx`**:

```jsx
import { AppProviders } from "@/app/AppProviders";
import { AppRoutes } from "@/app/AppRoutes";

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
```

### 7.9 How it works

1. The URL `/employees/42` matches `path="/"` → `employees` → `:employeeId`.
2. React Router renders `AppLayout`. At its `<Outlet />` it renders `EmployeeDetailPage`, which reads `employeeId = "42"` from `useParams()`.
3. Clicking a `NavLink` changes the URL with `history.pushState`. There's no page reload, and the layout (and its state, such as the collapsed sidebar) **stays mounted**. Only the outlet content changes.
4. An unknown URL falls through to `path="*"`.

Resize the browser below 1024px: the sidebar becomes a drawer, opened by the menu button and closed by the backdrop, the X button or clicking a link.

> 💡 **Interview question: "Why `<Link>` instead of `<a href>`?"** `<a>` triggers a full page load, which re-downloads the app and loses all state. `<Link>` updates the URL and lets React render the new route.

> 💡 **Interview question: "How do you pass data between routes?"** Prefer the URL (path params or search params) so it survives refreshes and can be shared. For transient data use `navigate(to, { state })` and read `useLocation().state`, as the login redirect will in Phase 10. For server data, refetch or use the query cache.

### 7.10 Exercises

1. Add a route `/employees/:employeeId/documents` with a placeholder page, and a link to it from the detail placeholder.
2. Collapse the sidebar and navigate between pages. Why does it stay collapsed? (Hint: which component owns the state, and does it unmount?)
3. In `ErrorBoundary`, temporarily make `DashboardPage` `throw new Error("boom")` in its body. Check the fallback, navigate away (the boundary resets), then remove the throw.

### 7.11 Common mistakes

> ⚠️ **Forgetting `<Outlet />`** in a layout: child routes match but render nothing.

> ⚠️ **Importing from `react-router-dom` with `react-router@7` installed.** Import from `react-router`.

> ⚠️ **A 404 when you refresh on a deep URL in production.** The server must send `index.html` for every path (Phase 21).

> ⚠️ **Leading slashes in nested routes** (`<Route path="/new">` inside `employees`). Child paths are relative. Use `new`.

### 7.12 Checkpoint

You can explain layout and index routes, `Outlet`, dynamic params, `NavLink` active styling, and why an error boundary and a Suspense boundary sit around the outlet. You can also justify the feature-based folder structure.

---

<a id="phase-8"></a>

## Phase 8: State Management Foundations (Context, useReducer, Zustand)

### 8.1 Learning objectives

- Classify state as local, global client, server or URL state, and choose the right tool for each.
- Recognise **prop drilling** and the ways to avoid it (composition, Context, a store).
- Use **Context** and **`useReducer`** to build a toast notification system.
- Use **Zustand** for global UI preferences with persistence: theme, sidebar, page size, density.

### 8.2 Where should state live?

Ask these questions in order:

1. **Can it be computed from something else?** Then it isn't state. Derive it.
2. **Does it come from the server?** It's **server state**. Use TanStack Query (Phase 11).
3. **Should it survive a refresh or be shareable as a link?** Put it in the **URL**.
4. **Is it used by one component or a small subtree?** Use **local state** (`useState`/`useReducer`), lifted only as high as needed.
5. **Is it needed across distant parts of the app?** Use **global client state**: Context or a store.

### 8.3 Prop drilling, and the three ways out

Prop drilling is passing props through components that don't use them, just to reach a deep child:

```jsx
// App → Layout → Topbar → UserMenu all receive `theme` only so ThemeToggle can use it.
<Layout theme={theme} setTheme={setTheme}>
```

1. **Composition (try this first).** Pass the finished element as `children` or as a prop, so the middle layers don't need to know: `<Layout topbarActions={<ThemeToggle theme={theme} onChange={setTheme} />}>`.
2. **Context.** Makes a value available to any descendant. Ideal for values that change **rarely** (theme, current user, a stable API like `toast`) or for **dependency injection**.
3. **An external store (Zustand/Redux).** Ideal for global state that changes often or is read by many components, because components subscribe to **slices** and re-render only when their slice changes.

> ⚠️ **The Context performance trap.** Every consumer re-renders whenever the provider's `value` changes. If you put frequently changing state (a form, a timer) and many consumers in one context, everything re-renders. Split contexts, memoise the `value`, or use a store.

### 8.4 `useContext`

| | |
|---|---|
| **Problem it solves** | Passing a value deep into the tree without prop drilling. |
| **Use it when** | Many components at different depths need the same, rarely-changing value or service. |
| **Don't use it when** | Only one or two levels need the value (pass props), or the value changes very frequently and has many consumers (use a store). |

### 8.5 `useReducer`

| | |
|---|---|
| **Problem it solves** | State with several related transitions. A reducer centralises **"how state changes"** in one pure, testable function: `(state, action) => newState`. |
| **Use it when** | The next state depends on the previous state in non-trivial ways, many event handlers update the same state, or you want to test transitions in isolation. |
| **Don't use it when** | It's a single independent value (`useState` is clearer). |
| **Rules** | Reducers must be **pure**: no API calls, no timers, no mutation. Return a new value. Strict Mode calls reducers twice to catch impurity. |

### 8.6 Build the toast system (Context + useReducer + portal)

Three small files keep **Fast Refresh** happy (a file should export only components, or only non-components).

**`src/components/feedback/toastContext.js`**

```js
import { createContext } from "react";

/** Holds the toast API ({ success, error, info, dismiss }), not the list of toasts. */
export const ToastContext = createContext(null);
```

**`src/components/feedback/useToast.js`**

```js
import { useContext } from "react";
import { ToastContext } from "./toastContext";

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) {
    // Fail loudly: a missing provider is a wiring bug, not a runtime condition.
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return toast;
}
```

**`src/components/feedback/ToastProvider.jsx`**

```jsx
import { useEffect, useMemo, useReducer, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleX, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { TOAST_DURATION_MS } from "@/lib/constants";
import { ToastContext } from "./toastContext";

const MAX_VISIBLE_TOASTS = 4;

// Pure reducer: every way the toast list can change is listed here.
function toastReducer(toasts, action) {
  switch (action.type) {
    case "added":
      return [...toasts, action.toast].slice(-MAX_VISIBLE_TOASTS); // keep only the newest few
    case "dismissed":
      return toasts.filter((toast) => toast.id !== action.id);
    default:
      throw new Error(`Unknown toast action: ${action.type}`);
  }
}

const TONE_STYLES = {
  success: { icon: CircleCheck, className: "text-green-600 dark:text-green-400" },
  error: { icon: CircleX, className: "text-red-600 dark:text-red-400" },
  info: { icon: Info, className: "text-sky-600 dark:text-sky-400" },
};

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextIdRef = useRef(0);

  // The API object is created ONCE. Components that only call toast.success(...)
  // never re-render when toasts appear or disappear, because the context value never changes.
  const api = useMemo(() => {
    function show(tone, message, { duration = TOAST_DURATION_MS } = {}) {
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      dispatch({ type: "added", toast: { id, tone, message, duration } });
      return id;
    }
    return {
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
      dismiss: (id) => dispatch({ type: "dismissed", id }),
    };
  }, []);

  return (
    <ToastContext value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={api.dismiss} />
    </ToastContext>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, className } = TONE_STYLES[toast.tone];

  // Each toast schedules its own removal; cleanup cancels it if dismissed early.
  useEffect(() => {
    const timeoutId = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timeoutId);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} aria-hidden="true" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-0.5 text-fg-muted hover:text-fg"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
```

**How it works.** `toasts` (which changes often) stays inside the provider and goes straight to `ToastViewport` as a prop. The context only carries the **stable** `api`. That's the "split the changing state from the stable API" pattern that avoids the Context trap. Usage anywhere below the provider:

```jsx
const toast = useToast();
toast.success("Employee saved.");
```

### 8.7 Zustand for global UI preferences

**Why Zustand rather than Redux Toolkit?** Both are excellent. PeopleDesk's global *client* state is small (session, theme, a few preferences) because server data lives in TanStack Query. Zustand gives you a store in a few lines, selector-based subscriptions, no provider, and a `persist` middleware. Redux Toolkit is a better fit for large teams that need strict conventions, very complex client state, time-travel debugging, or middleware-heavy flows. Many companies use it, so read [§8.11](#rtk-comparison) to know the equivalent.

```bash
npm install zustand@5
```

Create **`src/stores/uiStore.js`**:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const UI_STORAGE_KEY = "peopledesk-ui";

/**
 * Global UI preferences. `persist` saves them to localStorage under
 * UI_STORAGE_KEY and restores them on load.
 */
export const useUiStore = create(
  persist(
    (set) => ({
      theme: "system", // "light" | "dark" | "system"
      sidebarCollapsed: false,
      pageSize: DEFAULT_PAGE_SIZE,
      density: "comfortable", // "comfortable" | "compact"

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setPageSize: (pageSize) => set({ pageSize }),
      setDensity: (density) => set({ density }),
    }),
    { name: UI_STORAGE_KEY, version: 1 },
  ),
);
```

**Reading from the store.** Always select the slice you need:

```js
const theme = useUiStore((state) => state.theme);       // re-renders only when theme changes
const setTheme = useUiStore((state) => state.setTheme); // actions never change

// To select several values at once, use useShallow so a new object each time doesn't cause re-renders:
// import { useShallow } from "zustand/react/shallow";
// const { theme, density } = useUiStore(useShallow((s) => ({ theme: s.theme, density: s.density })));
```

> ⚠️ `const { theme } = useUiStore()` with no selector subscribes to **the whole store**, so the component re-renders on every change.

### 8.8 Theme switching

Create **`src/app/ThemeSync.jsx`**. It renders nothing; it **synchronises** the store with the `<html>` element, which is a textbook effect:

```jsx
import { useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUiStore } from "@/stores/uiStore";

export function ThemeSync() {
  const theme = useUiStore((state) => state.theme);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isDark = theme === "dark" || (theme === "system" && prefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"; // native scrollbars/inputs
  }, [isDark]);

  return null;
}
```

Create **`src/components/layout/ThemeToggle.jsx`**:

```jsx
import { Monitor, Moon, Sun } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useUiStore } from "@/stores/uiStore";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const CurrentIcon = THEME_ICONS[theme];

  return (
    <Dropdown label="Change theme" triggerSize="icon" triggerContent={<CurrentIcon className="h-5 w-5" aria-hidden="true" />}>
      <DropdownItem icon={Sun} onSelect={() => setTheme("light")}>Light</DropdownItem>
      <DropdownItem icon={Moon} onSelect={() => setTheme("dark")}>Dark</DropdownItem>
      <DropdownItem icon={Monitor} onSelect={() => setTheme("system")}>System</DropdownItem>
    </Dropdown>
  );
}
```

Prevent a flash of the light theme on reload by applying the saved theme **before** React loads. Replace **`index.html`**:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>PeopleDesk</title>
    <script>
      // Runs before React. Reads the same localStorage key the Zustand persist middleware writes.
      try {
        var saved = JSON.parse(localStorage.getItem("peopledesk-ui") || "{}").state || {};
        var theme = saved.theme || "system";
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme === "dark" || (theme === "system" && prefersDark)) {
          document.documentElement.classList.add("dark");
        }
      } catch (error) {
        /* storage unavailable: fall back to the light theme */
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 8.9 Move the sidebar state into the store

The user's collapsed preference should survive reloads, so it moves to the store. Notice that **`Sidebar` doesn't change at all**: it's presentational and still receives props. Only the parent changes where the value comes from.

Replace **`src/components/layout/AppLayout.jsx`** (version 2, final):

```jsx
import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { PageLoader } from "@/components/feedback/Loaders";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/uiStore";
import { OfflineBanner } from "./OfflineBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  // Global + persisted: the user's preference across sessions.
  const isSidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  // Local: whether the mobile drawer is open matters to nobody else and shouldn't persist.
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <OfflineBanner />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <ErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
```

Replace **`src/components/layout/Topbar.jsx`** (version 2):

```jsx
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ onOpenMobileNav }) {
  const isScrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6 lg:px-8",
        isScrolled && "shadow-sm",
      )}
    >
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
```

Replace **`src/app/AppProviders.jsx`** (version 2):

```jsx
import { BrowserRouter } from "react-router";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { ThemeSync } from "./ThemeSync";

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeSync />
        {children}
      </ToastProvider>
    </BrowserRouter>
  );
}
```

### 8.10 Try it

- Switch themes with the top bar button and reload: the choice persists, with no flash.
- Collapse the sidebar and reload: it stays collapsed.
- Open DevTools → Application → Local Storage and look at `peopledesk-ui`.
- Temporarily add this to `DashboardPage` to test toasts, then remove it:

```jsx
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/feedback/useToast";
// inside the component:
const toast = useToast();
// in the JSX:
<Button onClick={() => toast.success("Saved!")}>Toast</Button>
```

<a id="rtk-comparison"></a>

### 8.11 The same store in Redux Toolkit (for comparison)

You don't need to add this. It shows the equivalent so you can read RTK codebases:

```js
// uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { theme: "system", sidebarCollapsed: false },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload; // Immer lets you "mutate" a draft safely
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});
export const { setTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;

// usage: const theme = useSelector((s) => s.ui.theme); dispatch(setTheme("dark"));
// requires <Provider store={store}> at the root, and redux-persist for persistence.
```

### 8.12 Exercises

1. Add a `"cleared"` action to `toastReducer` and a `toast.clear()` API method.
2. Write a unit test in your head for `toastReducer`: given `[]` and an `added` action, what's returned? Why is a pure reducer easy to test?
3. Add a `reducedMotion` preference to the UI store and use it to disable the sidebar transition.

### 8.13 Common mistakes

> ⚠️ **Putting server data in Zustand or Context** ("fetch employees in an effect and store them globally"). You then have to rebuild caching, refetching and invalidation by hand. That's TanStack Query's job.

> ⚠️ **Creating the Context value inline** (`<Ctx value={{ user, logout }}>`): a new object every render re-renders every consumer. Memoise it.

> ⚠️ **Side effects inside a reducer** (fetch, `setTimeout`, `localStorage`). Reducers must be pure.

### 8.14 Checkpoint

You can place any piece of state in the right category, explain prop drilling and three ways to avoid it, explain when Context re-renders consumers, write a pure reducer, and use Zustand selectors correctly.

---

<a id="phase-9"></a>

## Phase 9: The API Layer (Axios, Interceptors, QueryClient)

### 9.1 Learning objectives

- Organise API code: one Axios instance, then per-feature API modules.
- Use **request interceptors** to attach the JWT, and **response interceptors** to refresh expired tokens transparently.
- Normalise API errors into user-friendly messages and form errors.
- Create the TanStack `QueryClient` and centralised **query keys**.

### 9.2 Install

```bash
npm install axios @tanstack/react-query@5 @tanstack/react-query-devtools@5
```

### 9.3 Why Axios (and how it compares to `fetch`)

| | `fetch` | Axios |
|---|---|---|
| Built in | ✅ | ❌ (a dependency) |
| Rejects on HTTP 4xx/5xx | ❌ (you must check `response.ok`) | ✅ |
| JSON parsing | Manual (`await res.json()`) | Automatic |
| Interceptors | ❌ | ✅ (ideal for auth headers and token refresh) |
| Base URL, timeouts, query param serialisation | Manual | Built in |
| Cancellation | `AbortController` | `AbortController` (`signal` option) |

A `fetch` example, for reference. Notice everything you have to do yourself:

```js
const response = await fetch(`${API_URL}/employees/?page=2`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```

> **JS concept: Promises and async/await.** A Promise represents a future value. `await` pauses an `async` function until the promise settles, and a rejected promise **throws** at the `await`, so you handle failures with `try/catch`. `async` functions always return a Promise.

### 9.4 The auth store (where tokens live)

The API client needs the tokens, so the auth store is created now. Phase 10 builds login on top of it.

Create **`src/features/auth/authStore.js`**:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AUTH_STORAGE_KEY = "peopledesk-auth";

/**
 * Session state.
 * - accessToken: short-lived, kept in MEMORY only (not persisted).
 * - refreshToken: persisted, so a reload can silently restore the session.
 * - user: the /auth/me/ payload; kept here because route guards need it synchronously.
 * - isReady: false until the startup session check has finished.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isReady: false,

      // SimpleJWT rotation returns a new refresh token on every refresh; keep the old one if absent.
      setTokens: ({ access, refresh }) =>
        set((state) => ({ accessToken: access, refreshToken: refresh ?? state.refreshToken })),
      setUser: (user) => set({ user }),
      markReady: () => set({ isReady: true }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ refreshToken: state.refreshToken }), // persist ONLY this field
    },
  ),
);
```

> **Security trade-off.** Any JavaScript on the page can read `localStorage`, so an XSS bug could steal the refresh token. The most secure setup stores the refresh token in an **httpOnly, Secure, SameSite cookie** that JavaScript can't read, with the backend setting it on login and reading it on refresh. That needs CSRF protection and same-site deployment, so this course uses localStorage plus short-lived in-memory access tokens, which is common and acceptable when you also prevent XSS. Be ready to discuss this in interviews.

### 9.5 The Axios instance and interceptors

Create **`src/lib/apiClient.js`**:

```js
import axios from "axios";
import { useAuthStore } from "@/features/auth/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const REQUEST_TIMEOUT_MS = 15_000;

/** The client every feature uses. */
export const apiClient = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

/** A bare client for the refresh call, so it never goes through the 401 interceptor below. */
const refreshClient = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

/** Drops empty values so `?search=&status=` never reaches the server. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

// ---------------------------------------------------------------------------
// Token refresh, de-duplicated.
// If five requests fail with 401 at once, they must share ONE refresh call. With
// refresh-token rotation, a second refresh using the same (now blacklisted)
// token would fail and log the user out. Strict Mode's double effects would
// trigger exactly that on startup.
// ---------------------------------------------------------------------------
let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return Promise.reject(new Error("No refresh token"));

    refreshPromise = refreshClient
      .post("/auth/refresh/", { refresh: refreshToken })
      .then(({ data }) => {
        useAuthStore.getState().setTokens(data);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null; // allow future refreshes
      });
  }
  return refreshPromise;
}

// REQUEST interceptor: attach the access token to every call.
apiClient.interceptors.request.use((config) => {
  // getState() reads the store outside React, without subscribing.
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// RESPONSE interceptor: on 401, refresh once and replay the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith("/auth/login") || original?.url?.startsWith("/auth/refresh");
    const canRetry =
      error.response?.status === 401 &&
      original &&
      !original._retry && // never loop
      !isAuthCall &&
      useAuthStore.getState().refreshToken;

    if (!canRetry) return Promise.reject(error);

    original._retry = true;
    try {
      const access = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original); // the caller never knows a refresh happened
    } catch (refreshError) {
      // The refresh token is expired or blacklisted: end the session. The route
      // guard (Phase 10) then sends the user to the login page.
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);
```

**How the refresh flow works**

```text
GET /employees/  ──► 401 (access expired)
      │
      ▼ interceptor
POST /auth/refresh/ {refresh}  ──► {access, refresh}   (shared by all concurrent 401s)
      │
      ▼
store.setTokens(...)  ──► replay GET /employees/ with the new token ──► 200 → caller
```

### 9.6 Normalising errors

Create **`src/lib/apiErrors.js`**:

```js
import axios from "axios";

/** DRF error values can be strings, arrays or nested objects. Find the first message. */
function firstMessage(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? firstMessage(value[0]) : null;
  if (value && typeof value === "object") return firstMessage(Object.values(value)[0]);
  return null;
}

/** Turns any error into one sentence suitable for a toast or alert. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") return "The request was cancelled.";
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The server took too long to respond."
        : "Can't reach the server. Check your connection.";
    }
    const { status, data } = error.response;
    if (status >= 500) return "The server had a problem. Please try again shortly.";
    if (status === 403 && !data?.detail) return "You don't have permission to do that.";
    if (data && typeof data === "object") {
      return firstMessage(data.detail) ?? firstMessage(data.non_field_errors) ?? firstMessage(data) ?? fallback;
    }
    return fallback;
  }
  return error?.message || fallback;
}

/**
 * Maps a DRF 400 response onto React Hook Form fields.
 * `{"email": ["already exists"]}` → setError("email", ...).
 * Anything that isn't a known field becomes a form-level error in `errors.root.serverError`.
 * Returns the names of the fields that received an error.
 */
export function setFormErrors(error, setError, fieldNames = []) {
  const data = error?.response?.status === 400 ? error.response.data : null;
  const appliedFields = [];

  if (data && typeof data === "object") {
    for (const field of fieldNames) {
      if (field in data) {
        setError(field, { type: "server", message: firstMessage(data[field]) ?? "Invalid value." });
        appliedFields.push(field);
      }
    }
  }

  if (appliedFields.length === 0 || data?.non_field_errors) {
    setError("root.serverError", {
      type: "server",
      message: firstMessage(data?.non_field_errors) ?? getErrorMessage(error),
    });
  }
  return appliedFields;
}
```

### 9.7 The QueryClient and query keys

TanStack Query gets a full explanation in Phase 11. Here you create the client so it's ready.

Create **`src/lib/queryKeys.js`**. A **query key** identifies a piece of cached server data. Centralising keys in a factory prevents typos and makes invalidation precise.

```js
/**
 * Hierarchical keys: invalidating ["employees"] also invalidates
 * ["employees", "list", {...}] and ["employees", "detail", "7"].
 * Detail ids are normalised to strings because useParams() returns strings,
 * and ["employees","detail",7] !== ["employees","detail","7"].
 */
export const queryKeys = {
  employees: {
    all: ["employees"],
    lists: () => [...queryKeys.employees.all, "list"],
    list: (filters) => [...queryKeys.employees.lists(), filters],
    details: () => [...queryKeys.employees.all, "detail"],
    detail: (id) => [...queryKeys.employees.details(), String(id)],
  },
  departments: {
    all: ["departments"],
    list: () => [...queryKeys.departments.all, "list"],
    detail: (id) => [...queryKeys.departments.all, "detail", String(id)],
  },
  leaves: {
    all: ["leaves"],
    list: (filters) => [...queryKeys.leaves.all, "list", filters],
  },
  users: {
    all: ["users"],
    list: () => [...queryKeys.users.all, "list"],
  },
  activities: {
    all: ["activities"],
    list: (filters) => [...queryKeys.activities.all, "list", filters],
  },
  dashboard: {
    all: ["dashboard"],
    stats: () => [...queryKeys.dashboard.all, "stats"],
  },
};
```

Create **`src/app/queryClient.js`**:

```js
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/authStore";

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data counts as fresh for 30s: no refetch on remount in that window
      gcTime: 5 * 60_000, // unused cache entries are garbage-collected after 5 minutes
      refetchOnWindowFocus: true, // come back to the tab → refresh stale data in the background
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false; // 4xx won't fix itself on retry
        return failureCount < MAX_RETRIES; // network blips and 5xx: retry with backoff
      },
    },
    mutations: { retry: false }, // never silently repeat a POST
  },
});

// Whenever the session ends (logout or a failed refresh), wipe the cache so the next
// user never sees the previous user's data.
useAuthStore.subscribe((state, previousState) => {
  if (previousState.user && !state.user) queryClient.clear();
});
```

Replace **`src/app/AppProviders.jsx`** (version 3, final):

```jsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { queryClient } from "./queryClient";
import { ThemeSync } from "./ThemeSync";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <ThemeSync />
          {children}
        </ToastProvider>
      </BrowserRouter>
      {/* Devtools are excluded from production builds automatically. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
```

### 9.8 How it connects

- Every feature will have an `api.js` that calls `apiClient` and returns `response.data`. Components never call Axios directly.
- Interceptors read the token with `useAuthStore.getState()`. Zustand stores work **outside React**, which Context can't do.
- Errors flow `Axios → TanStack Query → component`, and the component turns them into text with `getErrorMessage` or into field errors with `setFormErrors`.

### 9.9 Exercises

1. Add a request interceptor that logs `config.method` and `config.url` in development only (`import.meta.env.DEV`).
2. In `getErrorMessage`, add a friendly message for status `429` (rate limited).
3. Explain in two sentences why the refresh call uses `refreshClient` and not `apiClient`.

### 9.10 Common mistakes

> ⚠️ **Hard-coding `http://localhost:8000`** in feature code. Always go through `apiClient` and `VITE_API_URL`.

> ⚠️ **Setting `Content-Type: multipart/form-data` manually** for uploads. Axios and the browser must set it, with the boundary, when you pass `FormData`.

> ⚠️ **Infinite refresh loops.** Mark retried requests (`_retry`) and exclude the auth endpoints.

### 9.11 Checkpoint

You can describe the request lifecycle through both interceptors, why refreshes are de-duplicated, where tokens live and the security trade-off, how DRF errors become UI messages, and why query keys are hierarchical.

---

<a id="phase-10"></a>

## Phase 10: Authentication, Protected Routes and Role-Based Access

### 10.1 Learning objectives

- Build your first real form with **React Hook Form** and **Zod**.
- Implement login, logout and **persistent sessions** with silent refresh on startup.
- Guard routes with `ProtectedRoute` and `RoleRoute`, and hide UI with a permission system.
- Handle redirects with `<Navigate>` and `location.state`.

### 10.2 Install form libraries

```bash
npm install react-hook-form@7 zod@4 @hookform/resolvers@5
```

**Why React Hook Form?** It registers inputs as **uncontrolled** fields and reads values through refs, so typing doesn't re-render the whole form. It handles validation timing, touched/dirty state, submission state, field arrays and focusing the first error. **Why Zod?** One schema gives you validation rules **and** error messages, and you can reuse and unit-test it.

### 10.3 Auth API and session actions

Create **`src/features/auth/api.js`**:

```js
import { apiClient } from "@/lib/apiClient";

export const authApi = {
  login: async (credentials) => (await apiClient.post("/auth/login/", credentials)).data,
  me: async () => (await apiClient.get("/auth/me/")).data,
  updateMe: async (data) => (await apiClient.patch("/auth/me/", data)).data,
  changePassword: async (data) => {
    await apiClient.post("/auth/change-password/", data);
  },
  logout: async (refresh) => {
    await apiClient.post("/auth/logout/", { refresh });
  },
};
```

Create **`src/features/auth/session.js`**. Not everything needs to be a hook: these are plain async functions that act on the store.

```js
import { authApi } from "./api";
import { useAuthStore } from "./authStore";

/** Exchanges credentials for tokens, then loads the user. */
export async function login(credentials) {
  const { setTokens, setUser, clearSession } = useAuthStore.getState();
  const tokens = await authApi.login(credentials);
  setTokens(tokens);
  try {
    setUser(await authApi.me());
  } catch (error) {
    clearSession(); // don't leave a half-logged-in session behind
    throw error;
  }
}

/** Blacklists the refresh token on the server (best effort), then clears the session. */
export async function logout() {
  const { refreshToken, clearSession } = useAuthStore.getState();
  try {
    if (refreshToken) await authApi.logout(refreshToken);
  } catch {
    // Even if the server call fails, the user must be logged out locally.
  } finally {
    clearSession(); // route guards redirect; queryClient.js clears the cache
  }
}
```

### 10.4 Permissions: one source of truth for the UI

Create **`src/features/auth/permissions.js`**:

```js
import { ROLES } from "@/lib/constants";

const { ADMIN, HR, EMPLOYEE } = ROLES;

/**
 * Which roles may do what. Mirrors the backend permission classes.
 * IMPORTANT: this only shapes the UI. The API enforces the real rules;
 * hiding a button is not security.
 */
export const PERMISSIONS = {
  "employees.manage": [ADMIN, HR],
  "employees.delete": [ADMIN],
  "employees.viewHistory": [ADMIN, HR],
  "departments.manage": [ADMIN, HR],
  "leaves.review": [ADMIN, HR],
  "activity.view": [ADMIN, HR],
  "users.manage": [ADMIN],
  "leaves.request": [ADMIN, HR, EMPLOYEE],
};

export function hasPermission(user, permission) {
  if (!user) return false;
  return PERMISSIONS[permission]?.includes(user.role) ?? false;
}
```

Create **`src/features/auth/usePermission.js`**:

```js
import { useCallback } from "react";
import { useAuthStore } from "./authStore";
import { hasPermission } from "./permissions";

/** usePermission("employees.delete") → boolean */
export function usePermission(permission) {
  const user = useAuthStore((state) => state.user);
  return hasPermission(user, permission);
}

/** const can = useCan(); can("users.manage") → boolean. Handy for several checks. */
export function useCan() {
  const user = useAuthStore((state) => state.user);
  return useCallback((permission) => hasPermission(user, permission), [user]);
}
```

Create **`src/features/auth/components/Can.jsx`**: declarative permission checks in JSX.

```jsx
import { usePermission } from "../usePermission";

export function Can({ permission, fallback = null, children }) {
  return usePermission(permission) ? children : fallback;
}
```

### 10.5 Route guards

Create **`src/features/auth/components/ProtectedRoute.jsx`**:

```jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../authStore";

/** A layout route: renders child routes for logged-in users, otherwise redirects to /login. */
export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // Remember where the user was going, so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
```

Create **`src/features/auth/components/RoleRoute.jsx`**:

```jsx
import { Outlet } from "react-router";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { usePermission } from "../usePermission";

/** Renders child routes only if the user has `permission`. */
export function RoleRoute({ permission }) {
  const allowed = usePermission(permission);
  return allowed ? <Outlet /> : <ForbiddenPage />;
}
```

### 10.6 Restoring the session on startup

Create **`src/features/auth/components/AuthBootstrap.jsx`**:

```jsx
import { useEffect } from "react";
import { FullPageLoader } from "@/components/feedback/Loaders";
import { refreshAccessToken } from "@/lib/apiClient";
import { authApi } from "../api";
import { useAuthStore } from "../authStore";

/**
 * On first load, exchanges the persisted refresh token for an access token and
 * loads the user, BEFORE any route renders. Route guards therefore never see a
 * "logged out" flicker for a user who is actually logged in.
 */
export function AuthBootstrap({ children }) {
  const isReady = useAuthStore((state) => state.isReady);

  useEffect(() => {
    // `ignore` protects against setting state from a stale run. In Strict Mode this
    // effect runs twice; both runs share ONE refresh request (see refreshAccessToken),
    // and only the second run's results are applied.
    let ignore = false;

    async function restoreSession() {
      const { refreshToken, setUser, clearSession, markReady } = useAuthStore.getState();
      if (!refreshToken) {
        markReady();
        return;
      }
      try {
        await refreshAccessToken();
        const user = await authApi.me();
        if (!ignore) setUser(user);
      } catch {
        if (!ignore) clearSession(); // expired or revoked: start logged out
      } finally {
        if (!ignore) markReady();
      }
    }

    restoreSession();
    return () => {
      ignore = true;
    };
  }, []);

  if (!isReady) return <FullPageLoader label="Restoring your session…" />;
  return children;
}
```

### 10.7 Reusable form fields

Create **`src/hooks/useFieldIds.js`**: `useId` put to work.

```js
import { useId } from "react";

/** Ids that tie a label, input, hint and error message together for screen readers. */
export function useFieldIds(idFromProps, { hint, error } = {}) {
  const generatedId = useId();
  const id = idFromProps ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // The error replaces the hint visually, so describe the input with whichever is shown.
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return { id, hintId, errorId, describedBy };
}
```

Create **`src/components/form/fieldStyles.js`**:

```js
import { cn } from "@/lib/cn";

export function inputClasses(hasError, className) {
  return cn(
    "block w-full rounded-lg border bg-surface px-3 text-sm text-fg shadow-sm placeholder:text-fg-muted/70",
    "focus:outline-2 focus:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
    hasError ? "border-red-500 focus:outline-red-500" : "border-line focus:outline-indigo-600",
    className,
  );
}
```

Create **`src/components/form/Field.jsx`**: the shared label, hint and error layout.

```jsx
import { cn } from "@/lib/cn";

export function Field({ id, label, required, hint, hintId, error, errorId, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
```

Create **`src/components/form/TextField.jsx`**:

```jsx
import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

/**
 * Works with React Hook Form's register(): <TextField label="Email" {...register("email")} />
 * register() returns { name, onChange, onBlur, ref }. In React 19, `ref` arrives as a normal prop.
 */
export function TextField({ label, hint, error, required, id: idFromProps, className, ref, ...inputProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={inputClasses(Boolean(error), "h-10")}
        {...inputProps}
      />
    </Field>
  );
}
```

Create **`src/components/form/SelectField.jsx`**:

```jsx
import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

export function SelectField({ label, hint, error, required, options, placeholder, id: idFromProps, className, ref, ...selectProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses(Boolean(error), "h-10 pr-8")}
        {...selectProps}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
```

Create **`src/components/form/TextAreaField.jsx`**:

```jsx
import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

export function TextAreaField({ label, hint, error, required, rows = 4, id: idFromProps, className, ref, ...textareaProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses(Boolean(error), "py-2")}
        {...textareaProps}
      />
    </Field>
  );
}
```

Create **`src/components/form/CheckboxField.jsx`**:

```jsx
import { useId } from "react";

export function CheckboxField({ label, description, ref, ...inputProps }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} ref={ref} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line accent-indigo-600" {...inputProps} />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-fg-muted">{description}</span>}
      </label>
    </div>
  );
}
```

Create **`src/components/form/FormError.jsx`**: for form-level (non-field) errors.

```jsx
import { CircleAlert } from "lucide-react";

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
```

### 10.8 The login schema and page

Create **`src/features/auth/schemas.js`**:

```js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
```

Create **`src/components/layout/AuthLayout.jsx`**:

```jsx
import { Outlet } from "react-router";
import { Logo } from "./Logo";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
```

Create **`src/features/auth/pages/LoginPage.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/apiErrors";
import { useAuthStore } from "../authStore";
import { loginSchema } from "../schemas";
import { login } from "../session";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@peopledesk.test" },
  { label: "HR", email: "hr@peopledesk.test" },
  { label: "Employee", email: "employee@peopledesk.test" },
];
const DEMO_PASSWORD = "ChangeMe123!"; // from `python manage.py seed_demo`

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  useDocumentTitle("Sign in");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // State-driven redirect: once login stores a user, this component re-renders and
  // <Navigate> takes them where they were going (or to the dashboard).
  if (user) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}` : "/"} replace />;
  }

  // handleSubmit validates with Zod first and calls onSubmit only with valid, typed values.
  async function onSubmit(values) {
    try {
      await login(values);
    } catch (error) {
      setError("root.serverError", {
        message: error?.response?.status === 401 ? "Incorrect email or password." : getErrorMessage(error),
      });
    }
  }

  function fillDemoAccount(email) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Sign in to your account</h1>
      <p className="mt-1 text-sm text-fg-muted">Welcome back. Please enter your details.</p>

      {/* noValidate: let Zod, not the browser, show validation messages */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <FormError message={errors.root?.serverError?.message} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-xs text-fg-muted">Demo accounts (development only):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button key={account.email} variant="secondary" size="sm" onClick={() => fillDemoAccount(account.email)}>
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

**How the form works**

1. `useForm` creates the form state. `zodResolver(loginSchema)` plugs the schema in as the validator.
2. `register("email")` returns `{ name, onChange, onBlur, ref }`. Spreading it into `TextField` wires the **uncontrolled** input to RHF.
3. On submit, `handleSubmit` runs Zod. If it fails, `errors.email.message` holds the schema's message and RHF focuses the first invalid field. If it passes, `onSubmit(values)` runs, and `isSubmitting` stays `true` until the returned promise settles. That's why `onSubmit` is `async`.
4. Server failures go into `errors.root.serverError`, a form-level error.

> 💡 **Interview question: "Controlled or uncontrolled inputs for forms?"** Controlled inputs give you full control but re-render on every keystroke. Uncontrolled inputs (with refs) are cheaper. React Hook Form uses uncontrolled inputs by default and gives you `Controller` for components that must be controlled, such as custom selects and date pickers.

### 10.9 Navigation and top bar with permissions

Replace **`src/app/navigation.js`** (version 2, final):

```js
import { Building2, CalendarCheck, CalendarDays, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import { useCan } from "@/features/auth/usePermission";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/leaves", label: "My leave", icon: CalendarDays, end: true },
  { to: "/leaves/approvals", label: "Leave approvals", icon: CalendarCheck, permission: "leaves.review" },
  { to: "/users", label: "Users & roles", icon: ShieldCheck, permission: "users.manage" },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Navigation items the current user is allowed to see. */
export function useNavItems() {
  const can = useCan();
  return NAV_ITEMS.filter((item) => !item.permission || can(item.permission));
}
```

Create **`src/components/layout/UserMenu.jsx`**:

```jsx
import { useNavigate } from "react-router";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/features/auth/authStore";
import { logout } from "@/features/auth/session";
import { ROLE_OPTIONS, labelFor } from "@/lib/constants";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <Dropdown
      label="Account menu"
      triggerSize="md"
      triggerContent={
        <>
          <Avatar name={user.full_name} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-fg">{user.full_name}</span>
          </span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{user.full_name}</p>
        <p className="truncate text-xs text-fg-muted">{user.email}</p>
        <Badge tone="indigo" className="mt-2">
          {labelFor(ROLE_OPTIONS, user.role)}
        </Badge>
      </div>
      <div className="my-1 border-t border-line" />
      <DropdownItem icon={Settings} onSelect={() => navigate("/settings")}>
        Profile & settings
      </DropdownItem>
      <DropdownItem icon={LogOut} tone="danger" onSelect={logout}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
```

Replace **`src/components/layout/Topbar.jsx`** (version 3, final):

```jsx
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Topbar({ onOpenMobileNav }) {
  const isScrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6 lg:px-8",
        isScrolled && "shadow-sm",
      )}
    >
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
```

### 10.10 Protected routes

Replace **`src/app/AppRoutes.jsx`** (version 2):

```jsx
import { Route, Routes } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleRoute } from "@/features/auth/components/RoleRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import DepartmentDetailPage from "@/features/departments/pages/DepartmentDetailPage";
import DepartmentsPage from "@/features/departments/pages/DepartmentsPage";
import EmployeeCreatePage from "@/features/employees/pages/EmployeeCreatePage";
import EmployeeDetailPage from "@/features/employees/pages/EmployeeDetailPage";
import EmployeeEditPage from "@/features/employees/pages/EmployeeEditPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import LeaveApprovalsPage from "@/features/leaves/pages/LeaveApprovalsPage";
import MyLeavesPage from "@/features/leaves/pages/MyLeavesPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import NotFoundPage from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Everything below requires a logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="employees">
            <Route index element={<EmployeesPage />} />
            <Route path=":employeeId" element={<EmployeeDetailPage />} />
            {/* Role-based routing: only Admin/HR can create or edit */}
            <Route element={<RoleRoute permission="employees.manage" />}>
              <Route path="new" element={<EmployeeCreatePage />} />
              <Route path=":employeeId/edit" element={<EmployeeEditPage />} />
            </Route>
          </Route>

          <Route path="departments">
            <Route index element={<DepartmentsPage />} />
            <Route path=":departmentId" element={<DepartmentDetailPage />} />
          </Route>

          <Route path="leaves">
            <Route index element={<MyLeavesPage />} />
            <Route element={<RoleRoute permission="leaves.review" />}>
              <Route path="approvals" element={<LeaveApprovalsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute permission="users.manage" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

Replace **`src/App.jsx`** (final):

```jsx
import { AppProviders } from "@/app/AppProviders";
import { AppRoutes } from "@/app/AppRoutes";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </AppProviders>
  );
}
```

### 10.11 Test the whole flow

1. Visit `http://localhost:5173/employees`. You're redirected to `/login`.
2. Log in as **Employee**. You land back on `/employees`, the original destination. The sidebar has no "Leave approvals" or "Users & roles".
3. Type `/users` in the address bar. You see the 403 page.
4. Reload. You see "Restoring your session…" briefly, and you stay logged in.
5. Log out from the user menu. You're back at the login page. Log in as **Admin**: all menu items appear.
6. **Watch a silent refresh.** Set `ACCESS_TOKEN_LIFETIME` to `timedelta(minutes=1)` in Django settings, restart Django, log in, wait a minute, and navigate. In DevTools → Network you'll see a 401, then `/auth/refresh/`, then the retried request succeeding. Restore 15 minutes afterwards.

### 10.12 Exercises

1. Add a "Show password" toggle to the password field using local state and `type={visible ? "text" : "password"}`.
2. Use `<Can permission="users.manage">` to show an "Admin" badge next to the logo for admins only.
3. Why does `LoginPage` call its hooks *before* `if (user) return <Navigate …/>`? What would break otherwise?

### 10.13 Common mistakes

> ⚠️ **Treating frontend checks as security.** Anyone can call the API directly. Every rule in `PERMISSIONS` must also be enforced by DRF (and it is, in Phase 2).

> ⚠️ **Redirecting before the session is restored.** Without `AuthBootstrap`, a logged-in user who refreshes is briefly treated as logged out and bounced to `/login`.

> ⚠️ **`navigate()` during render.** Use the `<Navigate>` component in render, and `navigate()` in handlers and effects.

### 10.14 Checkpoint

You can explain the login → tokens → `/me` flow, how a session survives reloads, how the 401 → refresh → retry cycle works, why Strict Mode doesn't break it, how `ProtectedRoute` and `RoleRoute` compose as layout routes, and how React Hook Form + Zod validate a form.

---

<a id="phase-11"></a>

## Phase 11: Server State with TanStack Query: the Employee Directory

### 11.1 Learning objectives

- Understand **why** fetching in `useEffect` doesn't scale, and what TanStack Query adds.
- Use `useQuery`, query keys, `queryOptions`, caching, `staleTime`, background refetching, `placeholderData` and **prefetching**.
- Build the employee directory with **server-side search, filtering, sorting and pagination**, all stored in the **URL**.
- Render every async UI state: loading skeleton, error with retry, empty, background updating.

### 11.2 First, the hard way: fetching with `useEffect`

Here's a correct `useEffect` data hook. You can try it temporarily in a component, but don't keep it.

```jsx
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export function useEmployeesWithEffect(page) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController(); // lets cleanup cancel the request
    setIsLoading(true);
    setError(null);

    apiClient
      .get("/employees/", { params: { page }, signal: controller.signal })
      .then((response) => setData(response.data))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setError(err); // ignore our own cancellations
      })
      .finally(() => setIsLoading(false));

    // Without this, fast page changes can show page 2's data after page 3's: a RACE CONDITION.
    return () => controller.abort();
  }, [page]);

  return { data, error, isLoading };
}
```

Even this "correct" version has no **cache** (go back to page 1 and it refetches with a spinner), no **deduplication** (two components = two requests), no **retry**, no **refetch on focus or reconnect**, no way to **invalidate** after a mutation, no **prefetching**, and Strict Mode fires the request twice. Every one of those is a feature you'd have to build, for every endpoint.

> **When is `useEffect` fetching acceptable?** For tiny apps, one-off scripts, or data that really is "fetch once and forget" with no sharing. For anything resembling PeopleDesk, server state belongs in a server-state library.

### 11.3 TanStack Query concepts

| Concept | Meaning |
|---|---|
| **Query** | A cached piece of server data, identified by a **query key**, fetched by a **query function**. |
| **Query key** | An array like `["employees", "list", { page: 2 }]`. Different key = different cache entry. Keys are hashed deterministically, so object property order doesn't matter. |
| **`staleTime`** | How long data counts as fresh. Fresh data is served from the cache with no request. |
| **`gcTime`** | How long **unused** data stays in memory before garbage collection. |
| **Background refetch** | Stale data is shown **immediately**, then refreshed in the background on mount, window focus and reconnect. |
| **`isPending`** | There's no data yet (the first load). |
| **`isFetching`** | A request is in flight, including background refetches. |
| **`placeholderData: keepPreviousData`** | While a new key loads (page 3), keep showing the previous key's data (page 2) instead of a skeleton. |
| **Mutation** | A write (POST/PATCH/DELETE). Afterwards you **invalidate** or update the related queries (Phase 12). |

> 💡 **Interview question: "What's the difference between server state and client state?"** Server state is owned by the server: it can change without you knowing, it's shared, it needs caching, syncing and invalidation. Client state is owned by the browser session: theme, an open modal, form drafts. Different problems, different tools.

### 11.4 The employee and department API modules

Create **`src/features/employees/api.js`**:

```js
import { apiClient, cleanParams } from "@/lib/apiClient";

export const employeesApi = {
  /** GET /employees/?page&page_size&search&department&status&ordering → paginated envelope */
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/employees/", { params: cleanParams(params), signal })).data,

  get: async (id, { signal } = {}) => (await apiClient.get(`/employees/${id}/`, { signal })).data,

  /** `data` is FormData (multipart, for the photo). Axios sets the Content-Type boundary. */
  create: async (data) => (await apiClient.post("/employees/", data)).data,

  /** `data` can be FormData (full form) or a plain object (e.g. { status }) sent as JSON. */
  update: async (id, data) => (await apiClient.patch(`/employees/${id}/`, data)).data,

  remove: async (id) => {
    await apiClient.delete(`/employees/${id}/`);
  },
};
```

Create **`src/features/departments/api.js`**:

```js
import { apiClient } from "@/lib/apiClient";

export const departmentsApi = {
  /** Not paginated: returns an array. */
  list: async ({ signal } = {}) => (await apiClient.get("/departments/", { signal })).data,
  get: async (id, { signal } = {}) => (await apiClient.get(`/departments/${id}/`, { signal })).data,
  create: async (data) => (await apiClient.post("/departments/", data)).data,
  update: async (id, data) => (await apiClient.patch(`/departments/${id}/`, data)).data,
  remove: async (id) => {
    await apiClient.delete(`/departments/${id}/`);
  },
};
```

### 11.5 Query hooks

Create **`src/features/departments/queries.js`**:

```js
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { departmentsApi } from "./api";

const DEPARTMENTS_STALE_MS = 5 * 60_000; // departments rarely change: cache them longer

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn: ({ signal }) => departmentsApi.list({ signal }),
    staleTime: DEPARTMENTS_STALE_MS,
  });
}

export function useDepartment(id) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: ({ signal }) => departmentsApi.get(id, { signal }),
    enabled: Boolean(id),
  });
}
```

Create **`src/features/employees/queries.js`** (reads only; Phase 12 adds `mutations.js`):

```js
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { employeesApi } from "./api";

const PREFETCH_STALE_MS = 60_000;

/**
 * queryOptions() bundles key + fn so the SAME definition is used by useQuery,
 * prefetchQuery and tests. A key can never be paired with the wrong function.
 * TanStack passes an AbortSignal: if the key changes mid-request, it's cancelled.
 */
export function employeeListQuery(filters) {
  return queryOptions({
    queryKey: queryKeys.employees.list(filters),
    queryFn: ({ signal }) => employeesApi.list(filters, { signal }),
  });
}

export function employeeDetailQuery(id) {
  return queryOptions({
    queryKey: queryKeys.employees.detail(id),
    queryFn: ({ signal }) => employeesApi.get(id, { signal }),
  });
}

export function useEmployees(filters, { enabled = true } = {}) {
  return useQuery({
    ...employeeListQuery(filters),
    placeholderData: keepPreviousData, // no skeleton flash between pages or filters
    enabled,
  });
}

export function useEmployee(id) {
  const queryClient = useQueryClient();
  return useQuery({
    ...employeeDetailQuery(id),
    enabled: Boolean(id),
    // Arriving from the list? Show the row we already have while the full record loads.
    placeholderData: () => {
      const cachedPages = queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() });
      for (const [, page] of cachedPages) {
        const match = page?.results?.find((employee) => String(employee.id) === String(id));
        if (match) return match;
      }
      return undefined;
    },
  });
}

/** Returns a stable callback that warms the cache for an employee (e.g. on row hover). */
export function usePrefetchEmployee() {
  const queryClient = useQueryClient();
  return useCallback(
    (id) => queryClient.prefetchQuery({ ...employeeDetailQuery(id), staleTime: PREFETCH_STALE_MS }),
    [queryClient],
  );
}

/** Fetches the next page in the background, so clicking "Next" feels instant. */
export function usePrefetchNextEmployeesPage(filters, hasNextPage) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!hasNextPage) return;
    queryClient.prefetchQuery(employeeListQuery({ ...filters, page: filters.page + 1 }));
  }, [queryClient, filters, hasNextPage]);
}
```

### 11.6 URL state for filters

Filters live in the URL (`/employees?search=ann&status=ACTIVE&page=2`), so they survive refresh, the back button works, and links can be shared.

Create **`src/features/employees/hooks/useEmployeeFilters.js`**:

```js
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useUiStore } from "@/stores/uiStore";

export const DEFAULT_EMPLOYEE_ORDERING = "last_name";

/** Reads and writes the employee list filters from the URL query string. */
export function useEmployeeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPageSize = useUiStore((state) => state.pageSize);

  // useMemo keeps the SAME object while the URL is unchanged. It's used in a
  // query key and as an effect dependency, so a new object every render would refire them.
  const filters = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      page_size: Number(searchParams.get("page_size")) || defaultPageSize,
      search: searchParams.get("search") ?? "",
      department: searchParams.get("department") ?? "",
      status: searchParams.get("status") ?? "",
      ordering: searchParams.get("ordering") ?? DEFAULT_EMPLOYEE_ORDERING,
    }),
    [searchParams, defaultPageSize],
  );

  const setFilters = useCallback(
    (updates) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(updates)) {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
          }
          // Changing any filter other than the page sends you back to page 1.
          if (!("page" in updates)) next.delete("page");
          return next;
        },
        { replace: true }, // typing in search shouldn't create dozens of history entries
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const hasActiveFilters = Boolean(filters.search || filters.department || filters.status);

  return { filters, setFilters, resetFilters, hasActiveFilters };
}
```

### 11.7 Reusable list UI: search input and pagination

Create **`src/components/ui/SearchInput.jsx`**:

```jsx
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** A controlled, presentational search box. */
export function SearchInput({ value, onChange, placeholder = "Search…", label = "Search", className }) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-surface pr-9 pl-9 text-sm shadow-sm placeholder:text-fg-muted/70 focus:outline-2 focus:outline-indigo-600 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-fg-muted hover:text-fg"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </label>
  );
}
```

Create **`src/components/ui/Pagination.jsx`**:

```jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { Button } from "./Button";

export function Pagination({ page, pageSize, count, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const firstItem = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, count);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-line px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-fg-muted">
        Showing <span className="font-medium text-fg">{firstItem}</span>–<span className="font-medium text-fg">{lastItem}</span> of{" "}
        <span className="font-medium text-fg">{count}</span>
      </p>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-fg-muted">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-line bg-surface px-2 text-fg"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="text-fg-muted">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
```

### 11.8 Employee list components

Create **`src/features/employees/components/EmployeeStatusBadge.jsx`**:

```jsx
import { Badge } from "@/components/ui/Badge";
import { EMPLOYEE_STATUS_OPTIONS, labelFor } from "@/lib/constants";

const STATUS_TONES = { ACTIVE: "green", INACTIVE: "gray", ON_LEAVE: "yellow" };

export function EmployeeStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? "gray"}>{labelFor(EMPLOYEE_STATUS_OPTIONS, status)}</Badge>;
}
```

Create **`src/features/employees/components/SortableHeader.jsx`**. DRF's `ordering` uses `field` for ascending and `-field` for descending.

```jsx
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortableHeader({ label, field, ordering, onSort }) {
  const isActive = ordering === field || ordering === `-${field}`;
  const isDescending = ordering === `-${field}`;
  const Icon = !isActive ? ArrowUpDown : isDescending ? ArrowDown : ArrowUp;

  return (
    <th scope="col" aria-sort={isActive ? (isDescending ? "descending" : "ascending") : "none"} className="px-5 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(isActive && !isDescending ? `-${field}` : field)} // asc → desc → asc
        className="inline-flex items-center gap-1 font-medium hover:text-fg"
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}
```

Create **`src/features/employees/components/EmployeeRow.jsx`**. It's wrapped in `memo`; Phase 18 shows why with the Profiler.

```jsx
import { memo } from "react";
import { Link } from "react-router";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";

/**
 * memo: skip re-rendering this row unless its props change (shallow comparison).
 * That only pays off if the parent passes STABLE props: the same employee object
 * from the cache and callbacks wrapped in useCallback.
 */
export const EmployeeRow = memo(function EmployeeRow({
  employee,
  canManage,
  canDelete,
  onStatusChange,
  onDelete,
  onPrefetch,
  cellClassName,
}) {
  const cell = cn("px-5 whitespace-nowrap", cellClassName);

  return (
    <tr className="hover:bg-surface-muted/60">
      <td className={cell}>
        <Link
          to={`/employees/${employee.id}`}
          onMouseEnter={() => onPrefetch?.(employee.id)}
          onFocus={() => onPrefetch?.(employee.id)}
          className="flex items-center gap-3"
        >
          <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
          <span className="min-w-0">
            <span className="block font-medium text-fg hover:text-indigo-600">{employee.full_name}</span>
            <span className="block text-xs text-fg-muted">{employee.email}</span>
          </span>
        </Link>
      </td>
      <td className={cell}>{employee.job_title}</td>
      <td className={cell}>{employee.department_name ?? <span className="text-fg-muted">Unassigned</span>}</td>
      <td className={cell}>
        {canManage && onStatusChange ? (
          <select
            aria-label={`Status for ${employee.full_name}`}
            value={employee.status}
            onChange={(event) => onStatusChange(employee.id, event.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-sm"
          >
            {EMPLOYEE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <EmployeeStatusBadge status={employee.status} />
        )}
      </td>
      <td className={cell}>{formatDate(employee.hire_date)}</td>
      <td className={cn(cell, "text-right")}>
        <div className="flex justify-end gap-1">
          <Link to={`/employees/${employee.id}`} className={buttonClasses({ variant: "ghost", size: "icon-sm" })} aria-label={`View ${employee.full_name}`}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
          {canManage && (
            <Link to={`/employees/${employee.id}/edit`} className={buttonClasses({ variant: "ghost", size: "icon-sm" })} aria-label={`Edit ${employee.full_name}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          {canDelete && onDelete && (
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${employee.full_name}`} onClick={() => onDelete(employee)}>
              <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
});
```

Create **`src/features/employees/components/EmployeeTable.jsx`**:

```jsx
import { EmployeeRow } from "./EmployeeRow";
import { SortableHeader } from "./SortableHeader";

const DENSITY_CLASSES = { comfortable: "py-3.5", compact: "py-2" };

export function EmployeeTable({ employees, ordering, onSort, density = "comfortable", ...rowProps }) {
  return (
    // overflow-x-auto: on phones the table scrolls sideways instead of breaking the layout
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            <SortableHeader label="Employee" field="last_name" ordering={ordering} onSort={onSort} />
            <SortableHeader label="Job title" field="job_title" ordering={ordering} onSort={onSort} />
            <th scope="col" className="px-5 py-3 text-left font-medium">
              Department
            </th>
            <SortableHeader label="Status" field="status" ordering={ordering} onSort={onSort} />
            <SortableHeader label="Hired" field="hire_date" ordering={ordering} onSort={onSort} />
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} cellClassName={DENSITY_CLASSES[density]} {...rowProps} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Create **`src/features/employees/components/EmployeeFilters.jsx`**. The search box keeps **local** state for instant typing, and a **debounced callback** writes to the URL, so the API isn't called on every keystroke.

```jsx
import { useState } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { EMPLOYEE_STATUS_OPTIONS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";

const selectClasses = "h-10 rounded-lg border border-line bg-surface px-3 text-sm shadow-sm";

export function EmployeeFilters({ filters, onChange, onReset, departments, hasActiveFilters }) {
  // Local UI state: what's typed right now. The URL holds the debounced, "committed" value.
  const [searchText, setSearchText] = useState(filters.search);

  // If the URL's search changes from OUTSIDE this input (back button, a link, "Clear filters"),
  // copy it into the local text. This is React's "adjust state when a prop changes" pattern:
  // a setState during render, guarded by a comparison, with no effect and no extra paint.
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search);
    if (filters.search !== searchText.trim()) setSearchText(filters.search);
  }

  const commitSearch = useDebouncedCallback((value) => onChange({ search: value.trim() }), SEARCH_DEBOUNCE_MS);

  function handleSearchChange(value) {
    setSearchText(value); // instant feedback in the input
    commitSearch(value); // one API call once typing pauses
  }

  function handleReset() {
    setSearchText("");
    onReset();
  }

  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
      <SearchInput
        value={searchText}
        onChange={handleSearchChange}
        placeholder="Search name, email, ID or title…"
        label="Search employees"
        className="lg:max-w-sm lg:flex-1"
      />
      <select
        aria-label="Filter by department"
        value={filters.department}
        onChange={(event) => onChange({ department: event.target.value })}
        className={selectClasses}
      >
        <option value="">All departments</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        className={selectClasses}
      >
        <option value="">All statuses</option>
        {EMPLOYEE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasActiveFilters && (
        <Button variant="ghost" leftIcon={FilterX} onClick={handleReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
```

### 11.9 The employees page (version 1)

Replace **`src/features/employees/pages/EmployeesPage.jsx`**:

```jsx
import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useCan } from "@/features/auth/usePermission";
import { useDepartments } from "@/features/departments/queries";
import { getErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/uiStore";
import { EmployeeFilters } from "../components/EmployeeFilters";
import { EmployeeTable } from "../components/EmployeeTable";
import { useEmployeeFilters } from "../hooks/useEmployeeFilters";
import { useEmployees, usePrefetchEmployee, usePrefetchNextEmployeesPage } from "../queries";

export default function EmployeesPage() {
  const { filters, setFilters, resetFilters, hasActiveFilters } = useEmployeeFilters();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useEmployees(filters);
  const { data: departments } = useDepartments();
  const prefetchEmployee = usePrefetchEmployee();
  usePrefetchNextEmployeesPage(filters, Boolean(data?.next));
  const can = useCan();
  const density = useUiStore((state) => state.density);

  // One explicit branch per async state keeps the JSX below readable.
  let content;
  if (isPending) {
    content = <TableSkeleton rows={8} columns={6} />;
  } else if (isError) {
    content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (data.results.length === 0) {
    content = hasActiveFilters ? (
      <EmptyState title="No employees match your filters" description="Try a different search or clear the filters." />
    ) : (
      <EmptyState icon={Users} title="No employees yet" description="Add your first employee to get started." />
    );
  } else {
    content = (
      // Dim the old results while a new filter or page loads (keepPreviousData).
      <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
        <EmployeeTable
          employees={data.results}
          ordering={filters.ordering}
          onSort={(ordering) => setFilters({ ordering })}
          density={density}
          canManage={can("employees.manage")}
          onPrefetch={prefetchEmployee}
        />
        <Pagination
          page={filters.page}
          pageSize={filters.page_size}
          count={data.count}
          onPageChange={(page) => setFilters({ page })}
          onPageSizeChange={(page_size) => setFilters({ page_size })}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description={data ? `${data.count} people in the directory` : "Your company directory"}
        actions={
          <>
            {isFetching && !isPending && <Spinner className="h-4 w-4 text-fg-muted" />}
            {can("employees.manage") && (
              <Link to="/employees/new" className={buttonClasses()}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add employee
              </Link>
            )}
          </>
        }
      />
      <Card>
        <EmployeeFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          departments={departments ?? []}
          hasActiveFilters={hasActiveFilters}
        />
        {content}
      </Card>
    </>
  );
}
```

### 11.10 How it all connects

1. The URL is the source of truth. `useEmployeeFilters` parses it into a memoised `filters` object.
2. `useEmployees(filters)` builds the key `["employees", "list", filters]`. A new filter means a new key, which triggers a new request, and `keepPreviousData` keeps the old rows visible (dimmed) meanwhile.
3. Typing updates `searchText` instantly, and 400 ms after the last keystroke `setFilters({ search })` rewrites the URL. That produces a new key and **one** request.
4. Go back to a page you've seen: it renders **instantly from cache**, then refreshes in the background if stale.
5. Hovering a row prefetches the employee's detail, and the next page is prefetched automatically.
6. Open the **React Query Devtools** (flower icon, bottom-left) to watch keys, states (fresh/stale/fetching/inactive) and the cache.

> 💡 **Interview question: "How do you avoid unnecessary API requests?"** Debounce search input; cache with a sensible `staleTime`; deduplicate identical in-flight queries (TanStack does this); use `enabled` for dependent queries; keep previous data while paginating; prefetch likely next views; avoid effects that refetch on unstable dependencies.

### 11.11 Exercises

1. Add a "Hired after" date filter that maps to a new backend query parameter. In DRF, add a `django_filters.FilterSet` with `hire_date__gte`.
2. Make the URL support `?ordering=-hire_date` from a "Newest hires" quick-link on the dashboard.
3. Set `staleTime: 0` in `queryClient.js`, switch tabs in your browser and come back. Watch the background refetch in the Network tab.
4. Throttle the network in DevTools to "Slow 4G" and compare page changes with and without `placeholderData: keepPreviousData`.

### 11.12 Common mistakes

> ⚠️ **Putting non-serialisable or unstable values in query keys** (functions, class instances, `new Date()`). Keys must be plain, serialisable data.

> ⚠️ **Copying query data into `useState`** ("so I can edit it"). Now you have two sources of truth. Derive from the query, or initialise a form from it once.

> ⚠️ **Forgetting `queryFn` receives `{ signal }`.** Pass it to Axios so abandoned requests are cancelled.

> ⚠️ **Mismatched key types**: `detail(7)` vs `detail("7")`. The key factory normalises ids for exactly this reason.

### 11.13 Checkpoint

You can explain why TanStack Query beats hand-written effects for server state, the difference between `isPending` and `isFetching`, what `staleTime` and `gcTime` control, how query keys drive caching, why filters live in the URL, and how debouncing and prefetching reduce requests.

---

<a id="phase-12"></a>

## Phase 12: Employee CRUD: Forms, Validation, Uploads and Mutations

### 12.1 Learning objectives

- Use **`useMutation`**: `mutate` vs `mutateAsync`, invalidation, `setQueryData`, and **optimistic updates** with rollback.
- Build a **multi-step form** with React Hook Form and Zod, with per-step validation.
- Handle **file uploads** with previews and `FormData`, and **dynamic fields** with `useFieldArray`.
- Map **server-side validation errors** back onto fields.
- Build the profile page with tabs using **`useTransition`**, and delete with confirmation.

### 12.2 Mutations in one page

```js
const mutation = useMutation({
  mutationFn: (variables) => api.doSomething(variables), // returns a promise
  onMutate: (variables) => {},          // before the request: optimistic updates
  onSuccess: (data, variables) => {},   // update or invalidate the cache
  onError: (error, variables, context) => {}, // roll back optimistic updates
  onSettled: () => {},                  // always: final invalidation
});

mutation.mutate(variables, { onSuccess, onError }); // fire-and-forget; errors go to callbacks
await mutation.mutateAsync(variables);              // returns a promise; YOU must catch errors
mutation.isPending; mutation.error;
```

**Hook-level vs call-level callbacks.** Put cache logic (invalidation) in the hook, so it always runs. Put UI reactions (toasts, navigation, closing a modal) at the call site, so each screen decides its own behaviour.

**Invalidate vs `setQueryData`.** `invalidateQueries` marks data stale and refetches whatever is on screen. It's simple and always correct. `setQueryData` writes the server's response straight into the cache, so it's instant with no extra request. PeopleDesk uses both: write the detail with the response, and invalidate the lists (which might now be sorted or filtered differently).

### 12.3 Read layers this phase needs from other features

The employee profile shows the employee's leave history and activity, so you'll create the **read side** of the leaves and activity features now. Phase 14 adds leave *mutations*.

**`src/features/leaves/api.js`**

```js
import { apiClient, cleanParams } from "@/lib/apiClient";

export const leavesApi = {
  /** Paginated. Employees only ever receive their own requests (enforced by the API). */
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/leaves/", { params: cleanParams(params), signal })).data,
  create: async (data) => (await apiClient.post("/leaves/", data)).data,
  /** decision: "approve" | "reject" */
  review: async (id, decision, data) => (await apiClient.post(`/leaves/${id}/${decision}/`, data)).data,
  cancel: async (id) => (await apiClient.post(`/leaves/${id}/cancel/`)).data,
};
```

**`src/features/leaves/queries.js`**

```js
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { leavesApi } from "./api";

export function useLeaves(filters, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.leaves.list(filters),
    queryFn: ({ signal }) => leavesApi.list(filters, { signal }),
    placeholderData: keepPreviousData,
    enabled,
  });
}
```

**`src/features/leaves/components/LeaveStatusBadge.jsx`**

```jsx
import { Badge } from "@/components/ui/Badge";
import { LEAVE_STATUS_OPTIONS, labelFor } from "@/lib/constants";

const STATUS_TONES = { PENDING: "yellow", APPROVED: "green", REJECTED: "red", CANCELLED: "gray" };

export function LeaveStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? "gray"}>{labelFor(LEAVE_STATUS_OPTIONS, status)}</Badge>;
}
```

**`src/features/leaves/components/LeaveTable.jsx`** uses a **render prop**. `renderActions(leave)` lets each page decide which buttons a row gets (cancel on "My leave", approve/reject on "Approvals") without the table knowing about either.

```jsx
import { LEAVE_TYPE_OPTIONS, labelFor } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

export function LeaveTable({ leaves, showEmployee = false, renderActions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            {showEmployee && <th scope="col" className="px-5 py-3 font-medium">Employee</th>}
            <th scope="col" className="px-5 py-3 font-medium">Type</th>
            <th scope="col" className="px-5 py-3 font-medium">Dates</th>
            <th scope="col" className="px-5 py-3 font-medium">Days</th>
            <th scope="col" className="px-5 py-3 font-medium">Status</th>
            <th scope="col" className="px-5 py-3 font-medium">Reason / note</th>
            {renderActions && (
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {leaves.map((leave) => (
            <tr key={leave.id} className="align-top">
              {showEmployee && <td className="px-5 py-3.5 font-medium whitespace-nowrap">{leave.employee_name}</td>}
              <td className="px-5 py-3.5 whitespace-nowrap">{labelFor(LEAVE_TYPE_OPTIONS, leave.leave_type)}</td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
              </td>
              <td className="px-5 py-3.5">{leave.days}</td>
              <td className="px-5 py-3.5">
                <LeaveStatusBadge status={leave.status} />
              </td>
              <td className="max-w-xs px-5 py-3.5">
                <p className="line-clamp-2">{leave.reason}</p>
                {leave.review_note && (
                  <p className="mt-1 text-xs text-fg-muted">
                    {leave.reviewed_by_name ?? "Reviewer"}: {leave.review_note}
                  </p>
                )}
              </td>
              {renderActions && <td className="px-5 py-3.5 text-right whitespace-nowrap">{renderActions(leave)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**`src/features/activity/api.js`**

```js
import { apiClient, cleanParams } from "@/lib/apiClient";

export const activityApi = {
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/activities/", { params: cleanParams(params), signal })).data,
};
```

**`src/features/activity/queries.js`**

```js
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { activityApi } from "./api";

export function useActivities(filters, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.activities.list(filters),
    queryFn: ({ signal }) => activityApi.list(filters, { signal }),
    enabled,
  });
}
```

**`src/features/activity/components/ActivityFeed.jsx`**

```jsx
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative } from "@/lib/format";

export function ActivityFeed({ items }) {
  if (items.length === 0) {
    return <EmptyState icon={Activity} title="No activity yet" description="Changes will appear here." />;
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 px-5 py-3.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm">{item.description}</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {item.actor_name} · <time dateTime={item.created_at}>{formatRelative(item.created_at)}</time>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

### 12.4 Employee mutations (including an optimistic update)

Create **`src/features/employees/mutations.js`**:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { employeesApi } from "./api";

/** Employee changes affect department counts, dashboard stats and the activity feed too. */
function invalidateEmployeeRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => employeesApi.create(formData),
    onSuccess: (employee) => {
      // Seed the detail cache so the profile page renders instantly after redirect.
      queryClient.setQueryData(queryKeys.employees.detail(employee.id), employee);
      invalidateEmployeeRelated(queryClient);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => employeesApi.update(id, data),
    onSuccess: (employee) => {
      queryClient.setQueryData(queryKeys.employees.detail(employee.id), employee);
      invalidateEmployeeRelated(queryClient);
    },
  });
}

/**
 * OPTIMISTIC update: the status select changes instantly, before the server answers.
 * 1. onMutate  – cancel in-flight list fetches (they'd overwrite us), snapshot, write the new value
 * 2. onError   – restore the snapshot
 * 3. onSettled – refetch to make sure we match the server either way
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => employeesApi.update(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.all });

      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() });
      const previousDetail = queryClient.getQueryData(queryKeys.employees.detail(id));

      // Immutable update of every cached list page that contains this employee.
      queryClient.setQueriesData({ queryKey: queryKeys.employees.lists() }, (page) =>
        page
          ? { ...page, results: page.results.map((employee) => (employee.id === id ? { ...employee, status } : employee)) }
          : page,
      );
      if (previousDetail) {
        queryClient.setQueryData(queryKeys.employees.detail(id), { ...previousDetail, status });
      }

      return { previousLists, previousDetail }; // becomes `context` in onError
    },

    onError: (_error, { id }, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) queryClient.setQueryData(queryKeys.employees.detail(id), context.previousDetail);
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
      invalidateEmployeeRelated(queryClient);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => employeesApi.remove(id),
    // We deliberately DON'T invalidate or remove the deleted employee's detail query.
    // If the profile page is still mounted, that would trigger a refetch → 404 flash
    // before we navigate away. Once nothing uses it, it's garbage-collected.
    onSuccess: () => invalidateEmployeeRelated(queryClient),
  });
}
```

### 12.5 The employee schema and form helpers

Create **`src/features/employees/schemas.js`**:

```js
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_AVATAR_BYTES, MAX_EMERGENCY_CONTACTS } from "@/lib/constants";
import { toISODate } from "@/lib/format";

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  relationship: z.string().trim().max(50, "Keep it under 50 characters"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
});

export const employeeSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().max(30, "Keep it under 30 characters"),
  job_title: z.string().trim().min(2, "Job title is required").max(120),
  department: z.string(), // "" means "no department"; ids come from <select> as strings
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"], { error: "Choose a status" }),
  hire_date: z
    .string()
    .min(1, "Hire date is required")
    .refine((value) => value <= toISODate(), "Hire date can't be in the future"), // YYYY-MM-DD compares correctly as text
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_AVATAR_BYTES, "Image must be 2 MB or smaller")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Use a JPG, PNG or WEBP image")
    .nullable(),
  emergency_contacts: z.array(emergencyContactSchema).max(MAX_EMERGENCY_CONTACTS, `Add at most ${MAX_EMERGENCY_CONTACTS} contacts`),
});

/** Fields per wizard step: used to validate one step at a time. */
export const EMPLOYEE_FORM_STEPS = [
  { id: "personal", title: "Personal details", fields: ["first_name", "last_name", "email", "phone"] },
  { id: "job", title: "Job details", fields: ["job_title", "department", "status", "hire_date"] },
  { id: "extras", title: "Photo & contacts", fields: ["avatar", "emergency_contacts"] },
];

export const EMPLOYEE_FIELD_NAMES = EMPLOYEE_FORM_STEPS.flatMap((step) => step.fields);

/** A function, not a constant, so "today" is computed when the form opens. */
export function getEmptyEmployeeValues() {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    status: "ACTIVE",
    hire_date: toISODate(),
    avatar: null,
    emergency_contacts: [],
  };
}

/** API employee → form values (nulls become "" so inputs stay controlled-safe). */
export function toEmployeeFormValues(employee) {
  return {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone ?? "",
    job_title: employee.job_title,
    department: employee.department ? String(employee.department) : "",
    status: employee.status,
    hire_date: employee.hire_date,
    avatar: null, // a NEW file only; the current photo is shown separately
    emergency_contacts: (employee.emergency_contacts ?? []).map((contact) => ({
      name: contact.name,
      relationship: contact.relationship ?? "",
      phone: contact.phone,
    })),
  };
}

/** Form values → multipart FormData matching the API contract (Phase 2.11). */
export function toEmployeeFormData(values) {
  const { avatar, emergency_contacts: contacts, ...fields } = values; // rest: everything else
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value ?? "");
  }
  formData.append("emergency_contacts", JSON.stringify(contacts)); // multipart can't nest, so send JSON text
  if (avatar instanceof File) formData.append("avatar", avatar); // only when a new image was chosen
  return formData;
}
```

### 12.6 Building blocks: steps indicator, photo upload, dynamic contacts

Create **`src/components/ui/Steps.jsx`**:

```jsx
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Steps({ steps, currentIndex }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
              state === "current" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-line bg-surface",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                state === "upcoming" ? "bg-surface-muted text-fg-muted" : "bg-indigo-600 text-white",
              )}
            >
              {state === "complete" ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn("font-medium", state === "upcoming" && "text-fg-muted")}>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
```

Create **`src/features/employees/components/AvatarUpload.jsx`**:

```jsx
import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

/**
 * A controlled file field for React Hook Form's <Controller>.
 * `value` is a File or null; `currentUrl` is the photo already saved on the server.
 */
export function AvatarUpload({ value, onChange, onBlur, currentUrl, name, error }) {
  const inputRef = useRef(null); // the real <input type="file"> is hidden; buttons click it
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState(null);

  // Object URLs hold the file in memory until revoked. Revoke the old one whenever it
  // changes and on unmount. (This effect is a no-op on mount, so Strict Mode is fine.)
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the user pick the same file again after removing it
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file)); // created in the EVENT, not in an effect
    onChange(file);
    onBlur?.(); // mark as touched so validation runs immediately
  }

  function handleRemove() {
    setPreviewUrl(null);
    onChange(null);
  }

  const displayedUrl = value ? previewUrl : currentUrl;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">Profile photo</span>
      <div className="flex items-center gap-4">
        <Avatar src={displayedUrl} name={name} size="xl" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={Upload} onClick={() => inputRef.current?.click()}>
              {displayedUrl ? "Change photo" : "Upload photo"}
            </Button>
            {value && (
              <Button variant="ghost" size="sm" leftIcon={X} onClick={handleRemove}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-fg-muted">JPG, PNG or WEBP, up to 2 MB.</p>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Profile photo file"
          tabIndex={-1}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
```

Create **`src/features/employees/components/EmergencyContactsField.jsx`**:

```jsx
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { MAX_EMERGENCY_CONTACTS } from "@/lib/constants";

/** A DYNAMIC form section: rows are added and removed at runtime. */
export function EmergencyContactsField({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: "emergency_contacts" });
  const contactErrors = errors.emergency_contacts;
  const listError = contactErrors?.message ?? contactErrors?.root?.message;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Emergency contacts</legend>
      {fields.length === 0 && <p className="text-sm text-fg-muted">No emergency contacts added.</p>}

      {fields.map((field, index) => (
        // field.id is a stable key generated by RHF. Never use the index here:
        // removing row 1 would make row 2's inputs inherit row 1's DOM state.
        <div key={field.id} className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
          <TextField
            label="Name"
            required
            error={contactErrors?.[index]?.name?.message}
            {...register(`emergency_contacts.${index}.name`)}
          />
          <TextField
            label="Relationship"
            error={contactErrors?.[index]?.relationship?.message}
            {...register(`emergency_contacts.${index}.relationship`)}
          />
          <TextField
            label="Phone"
            type="tel"
            required
            error={contactErrors?.[index]?.phone?.message}
            {...register(`emergency_contacts.${index}.phone`)}
          />
          <Button variant="ghost" size="icon" className="sm:mt-7" aria-label={`Remove contact ${index + 1}`} onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
          </Button>
        </div>
      ))}

      {listError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{listError}</p>}

      <Button
        variant="secondary"
        size="sm"
        leftIcon={Plus}
        disabled={fields.length >= MAX_EMERGENCY_CONTACTS}
        onClick={() => append({ name: "", relationship: "", phone: "" })}
      >
        Add contact
      </Button>
    </fieldset>
  );
}
```

### 12.7 The multi-step employee form

Create **`src/features/employees/components/EmployeeForm.jsx`**:

```jsx
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Steps } from "@/components/ui/Steps";
import { useDepartments } from "@/features/departments/queries";
import { setFormErrors } from "@/lib/apiErrors";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";
import { EMPLOYEE_FIELD_NAMES, EMPLOYEE_FORM_STEPS, employeeSchema } from "../schemas";
import { AvatarUpload } from "./AvatarUpload";
import { EmergencyContactsField } from "./EmergencyContactsField";

/**
 * Used by BOTH the create and edit pages. The parent supplies `onSubmit(values)`,
 * which must return a promise. If it rejects, server errors are mapped onto fields.
 */
export function EmployeeForm({ defaultValues, onSubmit, onCancel, submitLabel, currentAvatarUrl }) {
  const [stepIndex, setStepIndex] = useState(0);
  const { data: departments } = useDepartments();
  const departmentOptions = useMemo(
    () => (departments ?? []).map((department) => ({ value: String(department.id), label: department.name })),
    [departments],
  );

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues, // read ONCE on mount (the edit page remounts the form with `key`)
    mode: "onTouched", // validate a field after it loses focus, then on every change
  });

  const isLastStep = stepIndex === EMPLOYEE_FORM_STEPS.length - 1;
  // getValues reads without subscribing. The names were typed on step 1, so reading
  // them when step 3 renders is enough. watch() here would re-render the whole form
  // on every keystroke.
  const fullName = `${getValues("first_name")} ${getValues("last_name")}`.trim(); // avatar initials

  async function goToNextStep() {
    // Validate only the current step's fields before moving on.
    const isStepValid = await trigger(EMPLOYEE_FORM_STEPS[stepIndex].fields, { shouldFocus: true });
    if (isStepValid) setStepIndex((index) => index + 1);
  }

  async function submit(values) {
    try {
      await onSubmit(values);
    } catch (error) {
      // e.g. {"email": ["employee with this email already exists."]} → error under the email field
      const failedFields = setFormErrors(error, setError, EMPLOYEE_FIELD_NAMES);
      // Jump to the first step that has a server error, so the user can see it.
      const stepWithError = EMPLOYEE_FORM_STEPS.findIndex((step) => step.fields.some((field) => failedFields.includes(field)));
      if (stepWithError !== -1) setStepIndex(stepWithError);
    }
  }

  // Pressing Enter (or "Continue") on an early step advances instead of submitting everything.
  function handleFormSubmit(event) {
    if (!isLastStep) {
      event.preventDefault();
      goToNextStep();
      return;
    }
    handleSubmit(submit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <Steps steps={EMPLOYEE_FORM_STEPS} currentIndex={stepIndex} />

      <Card className="mt-6">
        <div className="space-y-5 p-6">
          <FormError message={errors.root?.serverError?.message} />

          {/* Only the current step is mounted. RHF keeps values of unmounted fields
              (shouldUnregister defaults to false), so going Back loses nothing. */}
          {stepIndex === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="First name" required autoComplete="given-name" error={errors.first_name?.message} {...register("first_name")} />
              <TextField label="Last name" required autoComplete="family-name" error={errors.last_name?.message} {...register("last_name")} />
              <TextField label="Work email" type="email" required error={errors.email?.message} {...register("email")} />
              <TextField label="Phone" type="tel" hint="Include the country code" error={errors.phone?.message} {...register("phone")} />
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Job title" required error={errors.job_title?.message} {...register("job_title")} />
              <SelectField
                label="Department"
                placeholder="No department"
                options={departmentOptions}
                error={errors.department?.message}
                {...register("department")}
              />
              <SelectField label="Status" required options={EMPLOYEE_STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />
              <TextField label="Hire date" type="date" required error={errors.hire_date?.message} {...register("hire_date")} />
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-8">
              {/* Controller adapts a CONTROLLED custom component (value/onChange) to RHF. */}
              <Controller
                control={control}
                name="avatar"
                render={({ field, fieldState }) => (
                  <AvatarUpload
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    currentUrl={currentAvatarUrl}
                    name={fullName}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <EmergencyContactsField control={control} register={register} errors={errors} />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 border-t border-line px-6 py-4">
          <Button variant="secondary" onClick={stepIndex === 0 ? onCancel : () => setStepIndex((index) => index - 1)}>
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button type="submit" isLoading={isLastStep && isSubmitting}>
            {isLastStep ? submitLabel : "Continue"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
```

### 12.8 Create and edit pages

Replace **`src/features/employees/pages/EmployeeCreatePage.jsx`**:

```jsx
import { useNavigate } from "react-router";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "../components/EmployeeForm";
import { useCreateEmployee } from "../mutations";
import { getEmptyEmployeeValues, toEmployeeFormData } from "../schemas";

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createEmployee = useCreateEmployee();

  // mutateAsync returns a promise, so EmployeeForm can await it and catch server errors.
  async function handleSubmit(values) {
    const employee = await createEmployee.mutateAsync(toEmployeeFormData(values));
    toast.success(`${employee.full_name} was added.`);
    navigate(`/employees/${employee.id}`);
  }

  return (
    <>
      <PageHeader title="Add employee" description="Create a new employee record." backTo="/employees" backLabel="Employees" />
      <div className="max-w-3xl">
        <EmployeeForm
          defaultValues={getEmptyEmployeeValues()}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/employees")}
          submitLabel="Create employee"
        />
      </div>
    </>
  );
}
```

> `getEmptyEmployeeValues()` runs on every render, but `useForm` only reads `defaultValues` on mount, so this is harmless.

Replace **`src/features/employees/pages/EmployeeEditPage.jsx`**:

```jsx
import { useNavigate, useParams } from "react-router";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getErrorMessage } from "@/lib/apiErrors";
import { EmployeeForm } from "../components/EmployeeForm";
import { useUpdateEmployee } from "../mutations";
import { useEmployee } from "../queries";
import { toEmployeeFormData, toEmployeeFormValues } from "../schemas";

export default function EmployeeEditPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee();

  async function handleSubmit(values) {
    const updated = await updateEmployee.mutateAsync({ id: employee.id, data: toEmployeeFormData(values) });
    toast.success(`${updated.full_name} was updated.`);
    navigate(`/employees/${updated.id}`);
  }

  if (isPending) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader title={`Edit ${employee.full_name}`} backTo={`/employees/${employee.id}`} backLabel="Back to profile" />
      <div className="max-w-3xl">
        {/* key: if you navigate from one employee's edit page to another's, the form
            remounts and picks up the new defaultValues instead of keeping the old ones. */}
        <EmployeeForm
          key={employee.id}
          defaultValues={toEmployeeFormValues(employee)}
          currentAvatarUrl={employee.avatar}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${employee.id}`)}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}
```

### 12.9 Delete with confirmation

Create **`src/features/employees/components/DeleteEmployeeDialog.jsx`**:

```jsx
import { useToast } from "@/components/feedback/useToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/apiErrors";
import { useDeleteEmployee } from "../mutations";

/** Open when `employee` is set. Owns the delete mutation, so every caller gets the same behaviour. */
export function DeleteEmployeeDialog({ employee, onClose, onDeleted }) {
  const deleteEmployee = useDeleteEmployee();
  const toast = useToast();

  function handleConfirm() {
    deleteEmployee.mutate(employee.id, {
      onSuccess: () => {
        toast.success(`${employee.full_name} was deleted.`);
        onClose();
        onDeleted?.();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      isOpen={Boolean(employee)}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete employee?"
      message={`This permanently deletes ${employee?.full_name ?? "this employee"}, including their leave history. This can't be undone.`}
      confirmLabel="Delete employee"
      isLoading={deleteEmployee.isPending}
    />
  );
}
```

### 12.10 The employee profile page with `useTransition`

`useTransition` marks a state update as **non-urgent**. React can keep the current UI interactive while it prepares the update, and `isPending` tells you it's happening.

| | |
|---|---|
| **Problem it solves** | An expensive re-render (a heavy tab, a big list) blocking clicks and typing. |
| **Use it when** | Switching views or tabs, or filtering large client-side lists, where showing the old UI a moment longer is fine. |
| **Don't use it when** | Updating a controlled input's value (input updates must be urgent), or expecting it to speed up a network request. It schedules **rendering**; it doesn't make fetches faster unless you use Suspense-enabled data. |

Create **`src/components/ui/Tabs.jsx`**:

```jsx
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export function Tabs({ tabs, activeTab, onChange, isPending = false, label = "Sections" }) {
  return (
    <div role="tablist" aria-label={label} className="flex items-center gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-fg-muted hover:text-fg",
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>}
        </button>
      ))}
      {isPending && <Spinner className="ml-2 h-4 w-4 text-fg-muted" />}
    </div>
  );
}
```

Create **`src/features/employees/components/EmployeeOverview.jsx`**:

```jsx
import { Link } from "react-router";
import { formatDate } from "@/lib/format";

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-fg-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export function EmployeeOverview({ employee }) {
  return (
    <div className="space-y-8 p-6">
      <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Employee ID">{employee.employee_id}</DetailItem>
        <DetailItem label="Email">
          <a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline">
            {employee.email}
          </a>
        </DetailItem>
        <DetailItem label="Phone">{employee.phone || "—"}</DetailItem>
        <DetailItem label="Department">
          {employee.department ? (
            <Link to={`/departments/${employee.department}`} className="text-indigo-600 hover:underline">
              {employee.department_name}
            </Link>
          ) : (
            "Unassigned"
          )}
        </DetailItem>
        <DetailItem label="Hire date">{formatDate(employee.hire_date)}</DetailItem>
        <DetailItem label="Last updated">{formatDate(employee.updated_at)}</DetailItem>
      </dl>

      <section>
        <h3 className="text-sm font-semibold">Emergency contacts</h3>
        {employee.emergency_contacts?.length ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {employee.emergency_contacts.map((contact) => (
              // Contacts have no id; name + phone is unique enough for a static list.
              <li key={`${contact.name}-${contact.phone}`} className="rounded-lg border border-line p-4 text-sm">
                <p className="font-medium">{contact.name}</p>
                <p className="text-fg-muted">{contact.relationship || "Contact"}</p>
                <p className="mt-1">{contact.phone}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">None on file.</p>
        )}
      </section>
    </div>
  );
}
```

Create **`src/features/employees/components/EmployeeLeaveHistory.jsx`**:

```jsx
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { LeaveTable } from "@/features/leaves/components/LeaveTable";
import { useLeaves } from "@/features/leaves/queries";
import { getErrorMessage } from "@/lib/apiErrors";

const HISTORY_PAGE_SIZE = 20;

export function EmployeeLeaveHistory({ employeeId }) {
  const { data, isPending, isError, error, refetch } = useLeaves({ employee: employeeId, page: 1, page_size: HISTORY_PAGE_SIZE });

  if (isPending) return <TableSkeleton rows={3} columns={5} />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  if (data.results.length === 0) return <EmptyState icon={CalendarDays} title="No leave requests" />;
  return <LeaveTable leaves={data.results} />;
}
```

Create **`src/features/employees/components/EmployeeActivity.jsx`**:

```jsx
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useActivities } from "@/features/activity/queries";
import { getErrorMessage } from "@/lib/apiErrors";

export function EmployeeActivity({ employeeId }) {
  const { data, isPending, isError, error, refetch } = useActivities({
    target_type: "employee",
    target_id: employeeId,
    page_size: 20,
  });

  if (isPending) return <TableSkeleton rows={4} columns={2} />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  return <ActivityFeed items={data.results} />;
}
```

Replace **`src/features/employees/pages/EmployeeDetailPage.jsx`**:

```jsx
import { useState, useTransition } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Mail, Pencil, Trash2, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useCan } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { EmployeeActivity } from "../components/EmployeeActivity";
import { EmployeeLeaveHistory } from "../components/EmployeeLeaveHistory";
import { EmployeeOverview } from "../components/EmployeeOverview";
import { EmployeeStatusBadge } from "../components/EmployeeStatusBadge";
import { useEmployee } from "../queries";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTabPending, startTransition] = useTransition();
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    // Conditional spread: only Admin/HR see the history tabs.
    ...(can("employees.viewHistory")
      ? [
          { id: "leave", label: "Leave history" },
          { id: "activity", label: "Activity" },
        ]
      : []),
  ];

  function handleTabChange(tabId) {
    // Non-urgent: the tab bar responds immediately; the new panel renders when ready.
    startTransition(() => setActiveTab(tabId));
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError) {
    const isNotFound = error?.response?.status === 404;
    return (
      <Card>
        {isNotFound ? (
          <EmptyState icon={UserX} title="Employee not found" description="They may have been deleted." />
        ) : (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        )}
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={employee.full_name}
        backTo="/employees"
        backLabel="Employees"
        actions={
          <>
            <a href={`mailto:${employee.email}`} className={buttonClasses({ variant: "secondary" })}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </a>
            {can("employees.manage") && (
              <Link to={`/employees/${employee.id}/edit`} className={buttonClasses({ variant: "secondary" })}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            )}
            {can("employees.delete") && (
              <Button variant="danger" leftIcon={Trash2} onClick={() => setEmployeeToDelete(employee)}>
                Delete
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar src={employee.avatar} name={employee.full_name} size="xl" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{employee.job_title}</h2>
            <EmployeeStatusBadge status={employee.status} />
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            {employee.department_name ?? "No department"} · {employee.employee_id}
          </p>
        </div>
      </Card>

      <Card>
        <div className="px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} isPending={isTabPending} />
        </div>
        <div role="tabpanel" className={isTabPending ? "opacity-70" : undefined}>
          {activeTab === "overview" && <EmployeeOverview employee={employee} />}
          {activeTab === "leave" && <EmployeeLeaveHistory employeeId={employee.id} />}
          {activeTab === "activity" && <EmployeeActivity employeeId={employee.id} />}
        </div>
      </Card>

      <DeleteEmployeeDialog
        employee={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onDeleted={() => navigate("/employees", { replace: true })}
      />
    </>
  );
}
```

### 12.11 The employees page (version 2, final): status changes and deletes

Replace **`src/features/employees/pages/EmployeesPage.jsx`**:

```jsx
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useCan } from "@/features/auth/usePermission";
import { useDepartments } from "@/features/departments/queries";
import { getErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/uiStore";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { EmployeeFilters } from "../components/EmployeeFilters";
import { EmployeeTable } from "../components/EmployeeTable";
import { useEmployeeFilters } from "../hooks/useEmployeeFilters";
import { useUpdateEmployeeStatus } from "../mutations";
import { useEmployees, usePrefetchEmployee, usePrefetchNextEmployeesPage } from "../queries";

export default function EmployeesPage() {
  const { filters, setFilters, resetFilters, hasActiveFilters } = useEmployeeFilters();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useEmployees(filters);
  const { data: departments } = useDepartments();
  const prefetchEmployee = usePrefetchEmployee();
  usePrefetchNextEmployeesPage(filters, Boolean(data?.next));
  const { mutate: updateStatus } = useUpdateEmployeeStatus(); // `mutate` is a stable function
  const can = useCan();
  const toast = useToast();
  const density = useUiStore((state) => state.density);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // useCallback keeps these identities stable, so memoised EmployeeRows don't all re-render.
  const handleStatusChange = useCallback(
    (id, status) => updateStatus({ id, status }, { onError: (err) => toast.error(getErrorMessage(err)) }),
    [updateStatus, toast],
  );
  const handleDeleteRequest = useCallback((employee) => setEmployeeToDelete(employee), []);

  function handleDeleted() {
    // Deleting the only row on the last page would leave an empty page: step back one.
    if (data?.results.length === 1 && filters.page > 1) setFilters({ page: filters.page - 1 });
  }

  let content;
  if (isPending) {
    content = <TableSkeleton rows={8} columns={6} />;
  } else if (isError) {
    content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (data.results.length === 0) {
    content = hasActiveFilters ? (
      <EmptyState title="No employees match your filters" description="Try a different search or clear the filters." />
    ) : (
      <EmptyState icon={Users} title="No employees yet" description="Add your first employee to get started." />
    );
  } else {
    content = (
      <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
        <EmployeeTable
          employees={data.results}
          ordering={filters.ordering}
          onSort={(ordering) => setFilters({ ordering })}
          density={density}
          canManage={can("employees.manage")}
          canDelete={can("employees.delete")}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRequest}
          onPrefetch={prefetchEmployee}
        />
        <Pagination
          page={filters.page}
          pageSize={filters.page_size}
          count={data.count}
          onPageChange={(page) => setFilters({ page })}
          onPageSizeChange={(page_size) => setFilters({ page_size })}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description={data ? `${data.count} people in the directory` : "Your company directory"}
        actions={
          <>
            {isFetching && !isPending && <Spinner className="h-4 w-4 text-fg-muted" />}
            {can("employees.manage") && (
              <Link to="/employees/new" className={buttonClasses()}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add employee
              </Link>
            )}
          </>
        }
      />
      <Card>
        <EmployeeFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          departments={departments ?? []}
          hasActiveFilters={hasActiveFilters}
        />
        {content}
      </Card>
      <DeleteEmployeeDialog employee={employeeToDelete} onClose={() => setEmployeeToDelete(null)} onDeleted={handleDeleted} />
    </>
  );
}
```

### 12.12 How it all works

- **Create**: the wizard validates each step with `trigger(fields)`. The final submit runs the whole Zod schema, converts the values to `FormData`, and `mutateAsync` posts it. On success the detail cache is seeded, related lists are invalidated, a toast appears and you navigate to the new profile, which renders instantly from the seeded cache.
- **Server errors**: try creating an employee with an email that already exists. DRF answers `400 {"email": [...]}`. `setFormErrors` attaches the message to the email field and the form jumps back to step 1.
- **Upload**: the file input is uncontrolled and hidden. `AvatarUpload` turns its `change` event into a controlled `value` for RHF through `Controller`. The preview uses an object URL that's revoked by the effect cleanup.
- **Optimistic status**: change a status in the table. It updates instantly. Stop Django and try again: the select snaps back (rollback) and an error toast appears.
- **Tabs**: switching tabs is a transition. With React's concurrent rendering, a slow tab never freezes the tab buttons.

> 💡 **Interview question: "Walk me through an optimistic update."** Cancel outgoing fetches for that data, snapshot the current cache, write the expected result, return the snapshot as context; on error restore the snapshot; on settle invalidate so the cache matches the server. Use it for quick, likely-to-succeed actions (toggles, status changes), and avoid it for complex server-side logic.

### 12.13 Exercises

1. Warn before leaving the edit page with unsaved changes: use `formState.isDirty` and a `beforeunload` listener in an effect, with cleanup.
2. Add a "Remove current photo" option on the edit page. It should send `avatar=""` in the `FormData`. Check how DRF handles `allow_null`.
3. Make `EmployeeForm` show an "N errors on other steps" note when submitting fails validation on a step you're not viewing.
4. Turn the status `<select>` optimistic update into a pessimistic one (disable the select while `isPending`) and compare the feel.

### 12.14 Common mistakes

> ⚠️ **Calling `mutateAsync` without `try/catch`** gives you unhandled promise rejections. Either catch the error (as `EmployeeForm` does) or use `mutate` with `onError`.

> ⚠️ **Not cancelling queries in `onMutate`.** A background refetch that lands after your optimistic write overwrites it with old data.

> ⚠️ **Mutating cached data in place** in `setQueryData`. Always return new objects and arrays.

> ⚠️ **`defaultValues` from async data without a `key`** (or `reset`). The form keeps the values from its first render.

> ⚠️ **Forgetting to revoke object URLs** causes memory leaks when users pick many images.

### 12.15 Checkpoint

You can implement create, read, update and delete with TanStack Query, explain `mutate` vs `mutateAsync`, invalidation vs `setQueryData`, write an optimistic update with rollback, build a multi-step form with per-step validation, use `useFieldArray` and `Controller`, upload files with `FormData`, map server errors onto fields, and explain what `useTransition` does and doesn't do.

---

<a id="phase-13"></a>

## Phase 13: Department Management

### 13.1 Learning objectives

- Reinforce queries and mutations on a second resource.
- Build **forms inside modals**, and see how component lifecycle resets state for free.
- Assign employees with a **debounced search** inside a modal, using `useDebounce` and `enabled` queries.

### 13.2 Schema and mutations

Create **`src/features/departments/schemas.js`**:

```js
import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be 10 characters or fewer")
    .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
});

export const DEPARTMENT_FIELD_NAMES = ["name", "code", "description"];
```

Create **`src/features/departments/mutations.js`**:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/features/employees/api";
import { queryKeys } from "@/lib/queryKeys";
import { departmentsApi } from "./api";

function invalidateDepartmentRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useSaveDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    // One mutation for create and edit: the presence of `id` decides which.
    mutationFn: ({ id, data }) => (id ? departmentsApi.update(id, data) : departmentsApi.create(data)),
    onSuccess: () => {
      invalidateDepartmentRelated(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); // department names appear in employee rows
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => departmentsApi.remove(id),
    onSuccess: () => {
      invalidateDepartmentRelated(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); // members become "Unassigned"
    },
  });
}

/** Moves an employee into a department, or out of it with departmentId = null. */
export function useAssignDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, departmentId }) => employeesApi.update(employeeId, { department: departmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      invalidateDepartmentRelated(queryClient);
    },
  });
}
```

### 13.3 A form inside a modal

Create **`src/features/departments/components/DepartmentFormModal.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextAreaField } from "@/components/form/TextAreaField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { useSaveDepartment } from "../mutations";
import { DEPARTMENT_FIELD_NAMES, departmentSchema } from "../schemas";

/** `department` = the department to edit, or null to create one. */
export function DepartmentFormModal({ isOpen, onClose, department }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? "Edit department" : "New department"}
      description="Departments group employees for reporting and approvals."
    >
      {/* Modal renders nothing while closed, so DepartmentForm UNMOUNTS on close and
          mounts fresh on open: its form state resets without any reset() call. */}
      <DepartmentForm department={department} onDone={onClose} />
    </Modal>
  );
}

function DepartmentForm({ department, onDone }) {
  const toast = useToast();
  const saveDepartment = useSaveDepartment();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? "",
      description: department?.description ?? "",
    },
  });

  async function onSubmit(values) {
    try {
      const saved = await saveDepartment.mutateAsync({ id: department?.id, data: values });
      toast.success(department ? `${saved.name} was updated.` : `${saved.name} was created.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, DEPARTMENT_FIELD_NAMES); // e.g. duplicate code → under the Code field
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField label="Name" required error={errors.name?.message} {...register("name")} />
        <TextField label="Code" required hint="e.g. ENG" error={errors.code?.message} {...register("code")} />
      </div>
      <TextAreaField label="Description" rows={3} error={errors.description?.message} {...register("description")} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {department ? "Save changes" : "Create department"}
        </Button>
      </div>
    </form>
  );
}
```

### 13.4 The departments page

Create **`src/features/departments/components/DepartmentCard.jsx`**:

```jsx
import { Link } from "react-router";
import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DepartmentCard({ department, canManage, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/departments/${department.id}`} className="font-semibold hover:text-indigo-600">
            {department.name}
          </Link>
          <p className="text-xs font-medium tracking-wide text-fg-muted uppercase">{department.code}</p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${department.name}`} onClick={() => onEdit(department)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${department.name}`} onClick={() => onDelete(department)}>
              <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm text-fg-muted">{department.description || "No description."}</p>
      <p className="mt-4 flex items-center gap-1.5 text-sm">
        <Users className="h-4 w-4 text-fg-muted" aria-hidden="true" />
        {department.employee_count} {department.employee_count === 1 ? "employee" : "employees"}
      </p>
    </Card>
  );
}
```

Replace **`src/features/departments/pages/DepartmentsPage.jsx`**:

```jsx
import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePermission } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { DepartmentCard } from "../components/DepartmentCard";
import { DepartmentFormModal } from "../components/DepartmentFormModal";
import { useDeleteDepartment } from "../mutations";
import { useDepartments } from "../queries";

export default function DepartmentsPage() {
  const { data: departments, isPending, isError, error, refetch } = useDepartments();
  const canManage = usePermission("departments.manage");
  const deleteDepartment = useDeleteDepartment();
  const toast = useToast();

  const [search, setSearch] = useState("");
  // One piece of state describes the modal: closed (null), creating ({ department: null }) or editing.
  const [formState, setFormState] = useState(null);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // A short, already-loaded list: filtering on the client is simpler than a server round trip.
  const query = search.trim().toLowerCase();
  const visibleDepartments = (departments ?? []).filter(
    (department) => department.name.toLowerCase().includes(query) || department.code.toLowerCase().includes(query),
  );

  function handleConfirmDelete() {
    deleteDepartment.mutate(departmentToDelete.id, {
      onSuccess: () => {
        toast.success(`${departmentToDelete.name} was deleted.`);
        setDepartmentToDelete(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  let content;
  if (isPending) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <Card>
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </Card>
    );
  } else if (visibleDepartments.length === 0) {
    content = (
      <Card>
        <EmptyState icon={Building2} title={query ? "No matching departments" : "No departments yet"} />
      </Card>
    );
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDepartments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            canManage={canManage}
            onEdit={(selected) => setFormState({ department: selected })}
            onDelete={setDepartmentToDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Departments"
        description="How your organisation is structured."
        actions={
          canManage && (
            <Button leftIcon={Plus} onClick={() => setFormState({ department: null })}>
              New department
            </Button>
          )
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Filter departments…" label="Filter departments" className="mb-5 max-w-sm" />
      {content}

      <DepartmentFormModal isOpen={formState !== null} onClose={() => setFormState(null)} department={formState?.department ?? null} />
      <ConfirmDialog
        isOpen={Boolean(departmentToDelete)}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteDepartment.isPending}
        title="Delete department?"
        message={`${departmentToDelete?.name ?? "This department"} will be deleted. Its ${departmentToDelete?.employee_count ?? 0} employee(s) will become unassigned.`}
        confirmLabel="Delete department"
      />
    </>
  );
}
```

### 13.5 Department detail and assigning employees

Create **`src/features/departments/components/AssignEmployeeModal.jsx`**:

```jsx
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEmployees } from "@/features/employees/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/apiErrors";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { useAssignDepartment } from "../mutations";

const RESULTS_LIMIT = 8;

export function AssignEmployeeModal({ isOpen, onClose, department }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign to ${department.name}`} description="Search for an employee to move into this department.">
      <AssignEmployeeSearch department={department} />
    </Modal>
  );
}

// Mounted only while the modal is open, so the search box starts empty every time.
function AssignEmployeeSearch({ department }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const { data, isPending } = useEmployees({ search: debouncedSearch, page: 1, page_size: RESULTS_LIMIT, ordering: "last_name" });
  const assign = useAssignDepartment();
  const toast = useToast();

  const candidates = (data?.results ?? []).filter((employee) => employee.department !== department.id);

  function handleAssign(employee) {
    assign.mutate(
      { employeeId: employee.id, departmentId: department.id },
      {
        onSuccess: () => toast.success(`${employee.full_name} moved to ${department.name}.`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" label="Search employees" />
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState title="No employees to assign" description="Try another search." />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {candidates.map((employee) => (
            <li key={employee.id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{employee.full_name}</p>
                <p className="truncate text-xs text-fg-muted">{employee.department_name ?? "Unassigned"}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={UserPlus}
                isLoading={assign.isPending && assign.variables?.employeeId === employee.id}
                onClick={() => handleAssign(employee)}
              >
                Assign
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

> **`assign.variables`** holds the arguments of the latest `mutate` call, so only the clicked row shows a spinner.

Replace **`src/features/departments/pages/DepartmentDetailPage.jsx`**:

```jsx
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Building2, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { usePermission } from "@/features/auth/usePermission";
import { EmployeeStatusBadge } from "@/features/employees/components/EmployeeStatusBadge";
import { useEmployees } from "@/features/employees/queries";
import { useDisclosure } from "@/hooks/useDisclosure";
import { getErrorMessage } from "@/lib/apiErrors";
import { AssignEmployeeModal } from "../components/AssignEmployeeModal";
import { useAssignDepartment } from "../mutations";
import { useDepartment } from "../queries";

const MEMBERS_PAGE_SIZE = 10;

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  const [page, setPage] = useState(1);
  const canManage = usePermission("departments.manage");
  const assignModal = useDisclosure();
  const toast = useToast();

  const departmentQuery = useDepartment(departmentId);
  // A DEPENDENT view: the member list is filtered by the department from the URL.
  const membersQuery = useEmployees({ department: departmentId, page, page_size: MEMBERS_PAGE_SIZE, ordering: "last_name" });
  const removeMember = useAssignDepartment();

  function handleRemove(employee) {
    removeMember.mutate(
      { employeeId: employee.id, departmentId: null },
      {
        onSuccess: () => toast.success(`${employee.full_name} was removed from the department.`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  if (departmentQuery.isPending) return <Skeleton className="h-40 w-full" />;
  if (departmentQuery.isError) {
    return (
      <Card>
        <ErrorState message={getErrorMessage(departmentQuery.error)} onRetry={departmentQuery.refetch} />
      </Card>
    );
  }

  const department = departmentQuery.data;
  const members = membersQuery.data;

  return (
    <>
      <PageHeader
        title={department.name}
        description={department.description || `Department code ${department.code}`}
        backTo="/departments"
        backLabel="Departments"
        actions={
          canManage && (
            <Button leftIcon={UserPlus} onClick={assignModal.open}>
              Assign employee
            </Button>
          )
        }
      />

      <Card>
        <CardHeader title="Members" description={`${department.employee_count} employee(s)`} />
        {membersQuery.isPending ? (
          <TableSkeleton rows={4} columns={3} />
        ) : membersQuery.isError ? (
          <ErrorState message={getErrorMessage(membersQuery.error)} onRetry={membersQuery.refetch} />
        ) : members.results.length === 0 ? (
          <EmptyState icon={Building2} title="No members yet" description="Assign employees to this department." />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {members.results.map((employee) => (
                <li key={employee.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/employees/${employee.id}`} className="text-sm font-medium hover:text-indigo-600">
                      {employee.full_name}
                    </Link>
                    <p className="text-xs text-fg-muted">{employee.job_title}</p>
                  </div>
                  <EmployeeStatusBadge status={employee.status} />
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${employee.full_name} from department`}
                      isLoading={removeMember.isPending && removeMember.variables?.employeeId === employee.id}
                      onClick={() => handleRemove(employee)}
                    >
                      <UserMinus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={page} pageSize={MEMBERS_PAGE_SIZE} count={members.count} onPageChange={setPage} />
          </>
        )}
      </Card>

      {canManage && <AssignEmployeeModal isOpen={assignModal.isOpen} onClose={assignModal.close} department={department} />}
    </>
  );
}
```

### 13.6 How it connects

- `useEmployees` and `useAssignDepartment` are reused from other features. The query keys make all of it consistent: assigning someone invalidates `["employees"]` (every list, including this department's members and the search results) and `["departments"]` (the counts).
- The member list's page is **local state** here, not URL state. It's a secondary list on a detail page, so the URL would be overkill. That's a judgement call, not a rule.

### 13.7 Exercises

1. Add a "Manager" field to departments: a backend FK to `Employee`, plus a select in the form fed by `useEmployees`.
2. Show the department's members as small avatar stacks on each `DepartmentCard`. Which query would you use, and how would you avoid six requests for six cards?
3. Make the assign search optimistic: remove the assigned employee from `candidates` immediately.

### 13.8 Common mistakes

> ⚠️ **Resetting modal forms with effects** (`useEffect(() => reset(...), [department])`). Let the lifecycle do it: unmount on close, or change the `key`.

> ⚠️ **Forgetting related invalidations.** Department counts are derived on the server. If you don't invalidate departments after moving an employee, the cards show stale counts.

### 13.9 Checkpoint

You can build modal forms that reset naturally, model "create or edit" with one mutation, use a debounced search in a modal, show per-row pending states with `mutation.variables`, and decide between local and URL state.

---

<a id="phase-14"></a>

## Phase 14: Leave Management

### 14.1 Learning objectives

- Cross-field validation with Zod `.refine` and `path`.
- Live derived values with React Hook Form's `useWatch`.
- **Workflow state** (pending → approved, rejected or cancelled) driven by server actions.
- Role-aware UI on the same data: an employee view and an approver view.

### 14.2 Schema and mutations

Create **`src/features/leaves/schemas.js`**:

```js
import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    leave_type: z.enum(["ANNUAL", "SICK", "UNPAID", "OTHER"], { error: "Choose a leave type" }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    reason: z.string().trim().min(10, "Please give at least 10 characters").max(500, "Keep it under 500 characters"),
  })
  // Cross-field rule: runs after the individual fields pass. `path` attaches the error to end_date.
  .refine((values) => values.end_date >= values.start_date, {
    path: ["end_date"],
    error: "End date must be on or after the start date",
  });

export const LEAVE_FIELD_NAMES = ["leave_type", "start_date", "end_date", "reason"];

export const reviewSchema = z.object({
  review_note: z.string().trim().max(500, "Keep it under 500 characters"),
});
```

Create **`src/features/leaves/mutations.js`**:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { leavesApi } from "./api";

function invalidateLeaveRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }); // pending count
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => leavesApi.create(data),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}

/** decision: "approve" | "reject" */
export function useReviewLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, review_note }) => leavesApi.review(id, decision, { review_note }),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => leavesApi.cancel(id),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}
```

### 14.3 The leave request form

Create **`src/features/leaves/components/LeaveRequestModal.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextAreaField } from "@/components/form/TextAreaField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { LEAVE_TYPE_OPTIONS } from "@/lib/constants";
import { countDays, toISODate } from "@/lib/format";
import { useCreateLeave } from "../mutations";
import { LEAVE_FIELD_NAMES, leaveRequestSchema } from "../schemas";

export function LeaveRequestModal({ isOpen, onClose, onCreated }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request leave" description="Your request goes to HR for approval.">
      <LeaveRequestForm onDone={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function LeaveRequestForm({ onDone, onCreated }) {
  const toast = useToast();
  const createLeave = useCreateLeave();
  const today = toISODate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { leave_type: "", start_date: today, end_date: today, reason: "" },
  });

  // useWatch subscribes to specific fields. Only this component re-renders as dates change.
  const [startDate, endDate] = useWatch({ control, name: ["start_date", "end_date"] });
  const dayCount = countDays(startDate, endDate);

  async function onSubmit(values) {
    try {
      await createLeave.mutateAsync(values);
      toast.success(`Leave request for ${dayCount} day(s) submitted.`);
      onCreated?.();
      onDone();
    } catch (error) {
      // Overlaps come back as {"start_date": [...]}; a missing profile as non_field_errors.
      setFormErrors(error, setError, LEAVE_FIELD_NAMES);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <SelectField label="Leave type" required placeholder="Select a type" options={LEAVE_TYPE_OPTIONS} error={errors.leave_type?.message} {...register("leave_type")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Start date" type="date" required error={errors.start_date?.message} {...register("start_date")} />
        <TextField label="End date" type="date" required min={startDate} error={errors.end_date?.message} {...register("end_date")} />
      </div>
      <p className="text-sm text-fg-muted" aria-live="polite">
        {dayCount > 0 ? `${dayCount} calendar day(s)` : "Choose a valid date range"}
      </p>
      <TextAreaField label="Reason" required rows={3} error={errors.reason?.message} {...register("reason")} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Submit request
        </Button>
      </div>
    </form>
  );
}
```

### 14.4 Summary cards with `reduce`

Create **`src/features/leaves/components/LeaveSummary.jsx`**:

```jsx
import { Card } from "@/components/ui/Card";

/** Derives totals from the user's requests. No extra state, no extra endpoint. */
export function LeaveSummary({ leaves }) {
  const currentYear = String(new Date().getFullYear());

  const summary = leaves.reduce(
    (totals, leave) => {
      totals[leave.status] = (totals[leave.status] ?? 0) + 1;
      if (leave.status === "APPROVED" && leave.start_date.startsWith(currentYear)) {
        totals.approvedDaysThisYear += leave.days;
      }
      return totals; // mutating the accumulator is fine: it's a local object created by reduce
    },
    { approvedDaysThisYear: 0 },
  );

  const cards = [
    { label: "Pending", value: summary.PENDING ?? 0 },
    { label: "Approved", value: summary.APPROVED ?? 0 },
    { label: "Rejected", value: summary.REJECTED ?? 0 },
    { label: `Days taken in ${currentYear}`, value: summary.approvedDaysThisYear },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <p className="text-sm text-fg-muted">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
```

### 14.5 My leave page

Replace **`src/features/leaves/pages/MyLeavesPage.jsx`**:

```jsx
import { useState } from "react";
import { CalendarDays, CalendarPlus, UserX } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useAuthStore } from "@/features/auth/authStore";
import { useDisclosure } from "@/hooks/useDisclosure";
import { getErrorMessage } from "@/lib/apiErrors";
import { LEAVE_STATUS, LEAVE_STATUS_OPTIONS } from "@/lib/constants";
import { LeaveRequestModal } from "../components/LeaveRequestModal";
import { LeaveSummary } from "../components/LeaveSummary";
import { LeaveTable } from "../components/LeaveTable";
import { useCancelLeave } from "../mutations";
import { useLeaves } from "../queries";

const PAGE_SIZE = 10;
const SUMMARY_PAGE_SIZE = 100; // enough history for this year's summary
const STATUS_TABS = [{ id: "ALL", label: "All" }, ...LEAVE_STATUS_OPTIONS.map((option) => ({ id: option.value, label: option.label }))];

export default function MyLeavesPage() {
  const employeeId = useAuthStore((state) => state.user?.employee_id);
  const [statusTab, setStatusTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [leaveToCancel, setLeaveToCancel] = useState(null);
  const requestModal = useDisclosure();
  const cancelLeave = useCancelLeave();
  const toast = useToast();

  const hasProfile = Boolean(employeeId);
  // Admin/HR receive everyone's requests from /leaves/, so always filter to "me".
  const listQuery = useLeaves(
    { employee: employeeId, status: statusTab === "ALL" ? "" : statusTab, page, page_size: PAGE_SIZE },
    { enabled: hasProfile },
  );
  const summaryQuery = useLeaves({ employee: employeeId, page: 1, page_size: SUMMARY_PAGE_SIZE }, { enabled: hasProfile });

  function handleTabChange(tabId) {
    setStatusTab(tabId);
    setPage(1); // a new filter starts at page 1. Both updates are batched into one render.
  }

  function handleConfirmCancel() {
    cancelLeave.mutate(leaveToCancel.id, {
      onSuccess: () => {
        toast.success("Leave request cancelled.");
        setLeaveToCancel(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  if (!hasProfile) {
    return (
      <>
        <PageHeader title="My leave" />
        <Card>
          <EmptyState icon={UserX} title="No employee profile" description="Your account isn't linked to an employee record, so you can't request leave." />
        </Card>
      </>
    );
  }

  let content;
  if (listQuery.isPending) {
    content = <TableSkeleton rows={4} columns={5} />;
  } else if (listQuery.isError) {
    content = <ErrorState message={getErrorMessage(listQuery.error)} onRetry={listQuery.refetch} />;
  } else if (listQuery.data.results.length === 0) {
    content = <EmptyState icon={CalendarDays} title="No leave requests here" description="Requests you make will appear in this list." />;
  } else {
    content = (
      <>
        <LeaveTable
          leaves={listQuery.data.results}
          renderActions={(leave) =>
            leave.status === LEAVE_STATUS.PENDING && (
              <Button variant="ghost" size="sm" onClick={() => setLeaveToCancel(leave)}>
                Cancel
              </Button>
            )
          }
        />
        <Pagination page={page} pageSize={PAGE_SIZE} count={listQuery.data.count} onPageChange={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My leave"
        description="Request time off and track your requests."
        actions={
          <Button leftIcon={CalendarPlus} onClick={requestModal.open}>
            Request leave
          </Button>
        }
      />
      {summaryQuery.data && <LeaveSummary leaves={summaryQuery.data.results} />}
      <Card>
        <div className="px-4">
          <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={handleTabChange} label="Filter by status" />
        </div>
        {content}
      </Card>

      <LeaveRequestModal isOpen={requestModal.isOpen} onClose={requestModal.close} onCreated={() => handleTabChange(LEAVE_STATUS.PENDING)} />
      <ConfirmDialog
        isOpen={Boolean(leaveToCancel)}
        onClose={() => setLeaveToCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={cancelLeave.isPending}
        title="Cancel this request?"
        message="HR will no longer see this request. You can submit a new one later."
        confirmLabel="Cancel request"
      />
    </>
  );
}
```

### 14.6 Approvals for HR and Admin

Create **`src/features/leaves/components/ReviewLeaveModal.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextAreaField } from "@/components/form/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { LEAVE_TYPE_OPTIONS, labelFor } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useReviewLeave } from "../mutations";
import { reviewSchema } from "../schemas";

/** `review` = { leave, decision: "approve" | "reject" } or null when closed. */
export function ReviewLeaveModal({ review, onClose }) {
  const title = review?.decision === "approve" ? "Approve leave" : "Reject leave";
  return (
    <Modal isOpen={Boolean(review)} onClose={onClose} title={title}>
      {review && <ReviewForm leave={review.leave} decision={review.decision} onDone={onClose} />}
    </Modal>
  );
}

function ReviewForm({ leave, decision, onDone }) {
  const toast = useToast();
  const reviewLeave = useReviewLeave();
  const isApproval = decision === "approve";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { review_note: "" } });

  async function onSubmit({ review_note }) {
    try {
      await reviewLeave.mutateAsync({ id: leave.id, decision, review_note });
      toast.success(`Leave for ${leave.employee_name} was ${isApproval ? "approved" : "rejected"}.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, ["review_note"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="rounded-lg bg-surface-muted p-4 text-sm">
        <p className="font-medium">{leave.employee_name}</p>
        <p className="text-fg-muted">
          {labelFor(LEAVE_TYPE_OPTIONS, leave.leave_type)} · {formatDate(leave.start_date)} – {formatDate(leave.end_date)} ({leave.days} day
          {leave.days === 1 ? "" : "s"})
        </p>
        <p className="mt-2">{leave.reason}</p>
      </div>
      <TextAreaField
        label={isApproval ? "Note (optional)" : "Reason for rejection"}
        rows={3}
        error={errors.review_note?.message}
        {...register("review_note")}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant={isApproval ? "primary" : "danger"} isLoading={isSubmitting}>
          {isApproval ? "Approve" : "Reject"}
        </Button>
      </div>
    </form>
  );
}
```

Replace **`src/features/leaves/pages/LeaveApprovalsPage.jsx`**:

```jsx
import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useAuthStore } from "@/features/auth/authStore";
import { getErrorMessage } from "@/lib/apiErrors";
import { LEAVE_STATUS, LEAVE_STATUS_OPTIONS } from "@/lib/constants";
import { LeaveTable } from "../components/LeaveTable";
import { ReviewLeaveModal } from "../components/ReviewLeaveModal";
import { useLeaves } from "../queries";

const PAGE_SIZE = 10;
const STATUS_TABS = [...LEAVE_STATUS_OPTIONS.map((option) => ({ id: option.value, label: option.label })), { id: "ALL", label: "All history" }];

export default function LeaveApprovalsPage() {
  const myEmployeeId = useAuthStore((state) => state.user?.employee_id);
  const [statusTab, setStatusTab] = useState(LEAVE_STATUS.PENDING); // the queue is what matters most
  const [page, setPage] = useState(1);
  const [review, setReview] = useState(null);

  const { data, isPending, isError, error, refetch } = useLeaves({
    status: statusTab === "ALL" ? "" : statusTab,
    page,
    page_size: PAGE_SIZE,
    ordering: statusTab === LEAVE_STATUS.PENDING ? "start_date" : "-created_at", // soonest first in the queue
  });

  function handleTabChange(tabId) {
    setStatusTab(tabId);
    setPage(1);
  }

  function renderActions(leave) {
    if (leave.status !== LEAVE_STATUS.PENDING) return null;
    // Mirrors the API rule: you can't review your own request.
    const isOwnRequest = leave.employee === myEmployeeId;
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" leftIcon={X} disabled={isOwnRequest} onClick={() => setReview({ leave, decision: "reject" })}>
          Reject
        </Button>
        <Button
          size="sm"
          leftIcon={Check}
          disabled={isOwnRequest}
          title={isOwnRequest ? "You can't review your own request" : undefined}
          onClick={() => setReview({ leave, decision: "approve" })}
        >
          Approve
        </Button>
      </div>
    );
  }

  let content;
  if (isPending) {
    content = <TableSkeleton rows={5} columns={6} />;
  } else if (isError) {
    content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (data.results.length === 0) {
    content = (
      <EmptyState
        icon={Inbox}
        title={statusTab === LEAVE_STATUS.PENDING ? "All caught up" : "Nothing here"}
        description={statusTab === LEAVE_STATUS.PENDING ? "There are no requests waiting for review." : undefined}
      />
    );
  } else {
    content = (
      <>
        <LeaveTable leaves={data.results} showEmployee renderActions={renderActions} />
        <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Leave approvals" description="Review requests and browse the leave history." />
      <Card>
        <div className="px-4">
          <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={handleTabChange} label="Filter by status" />
        </div>
        {content}
      </Card>
      <ReviewLeaveModal review={review} onClose={() => setReview(null)} />
    </>
  );
}
```

### 14.7 Try the workflow

1. Log in as **Employee** and request leave. Then try to request overlapping dates: the server error appears under "Start date".
2. Log in as **HR** and open **Leave approvals**. Approve Evan's request with a note.
3. Log back in as **Employee**. The request shows "Approved" with HR's note, and the summary updated.
4. As HR, request leave yourself, then open the approvals queue: your own request's buttons are disabled. Remove `disabled` temporarily and try anyway. The API answers 403, proving the backend enforces the rule.

### 14.8 Exercises

1. Exclude weekends from the day count in `countDays` and mirror the rule on the backend.
2. Add an "Approve all visible" bulk action with `Promise.allSettled` and a summary toast ("8 approved, 1 failed").
3. Make the approvals tab state live in the URL (`?status=APPROVED`) and compare the code with the local-state version.
4. Add a leave-balance endpoint (entitlement minus approved days) and show it in `LeaveSummary`.

### 14.9 Common mistakes

> ⚠️ **Validating date ranges only on the client.** The backend checks overlaps and ordering too. Never trust the client alone.

> ⚠️ **`watch()` at the top of a large form** re-renders the whole form on every keystroke. Prefer `useWatch` scoped to the fields you need, in the component that needs them.

> ⚠️ **Comparing date strings in different formats.** `YYYY-MM-DD` strings compare correctly as text. Anything else must be parsed first.

### 14.10 Checkpoint

You can write cross-field Zod rules, derive live values with `useWatch`, use render props to customise shared tables, build role-specific views over the same API, and explain why the backend must repeat every important rule.

---

<a id="phase-15"></a>

## Phase 15: The Dashboard and Data Visualisation

### 15.1 Learning objectives

- Turn API aggregates into charts with **Recharts**.
- Use `useMemo` for derived chart data, and understand TanStack Query's **structural sharing**.
- Poll in the background with `refetchInterval`.
- Show different content per role on the same page.

### 15.2 Install

```bash
npm install recharts@3
```

### 15.3 Data layer

Create **`src/features/dashboard/api.js`**:

```js
import { apiClient } from "@/lib/apiClient";

export const dashboardApi = {
  stats: async ({ signal } = {}) => (await apiClient.get("/dashboard/stats/", { signal })).data,
};
```

Create **`src/features/dashboard/queries.js`**:

```js
import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_REFRESH_MS } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import { dashboardApi } from "./api";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: ({ signal }) => dashboardApi.stats({ signal }),
    // Background polling: refresh every minute while the tab is visible.
    refetchInterval: DASHBOARD_REFRESH_MS,
    refetchIntervalInBackground: false, // don't poll from hidden tabs
  });
}
```

> **Structural sharing.** When a refetch returns data that's deep-equal to the cache, TanStack Query keeps the **old object references**. Polling every minute therefore doesn't re-render charts or restart their animations unless something actually changed.

### 15.4 Chart theme and components

Create **`src/features/dashboard/chartTheme.js`**. Charts read the same CSS tokens as the rest of the UI, so they follow dark mode automatically.

```js
export const CHART_PRIMARY = "#6366f1"; // indigo-500: readable in both themes

export const STATUS_COLORS = {
  ACTIVE: "#22c55e",
  INACTIVE: "#94a3b8",
  ON_LEAVE: "#f59e0b",
};

export const AXIS_TICK = { fill: "var(--color-fg-muted)", fontSize: 12 };

export const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  borderRadius: 8,
  color: "var(--color-fg)",
  fontSize: 13,
};
```

Create **`src/features/dashboard/components/StatCard.jsx`**:

```jsx
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  yellow: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

/** A KPI tile. With `to`, the whole card links to a pre-filtered view. */
export function StatCard({ label, value, icon: Icon, tone = "indigo", to }) {
  const body = (
    <Card className={cn("flex items-center gap-4 p-5", to && "transition-shadow hover:shadow-md")}>
      <span className={cn("rounded-lg p-3", TONES[tone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-fg-muted">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-600">
      {body}
    </Link>
  ) : (
    body
  );
}
```

Create **`src/features/dashboard/components/ChartCard.jsx`**:

```jsx
import { Card, CardHeader } from "@/components/ui/Card";

export function ChartCard({ title, description, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {/* Recharts' ResponsiveContainer needs a parent with an explicit height. */}
      <div className="h-72 p-4">{children}</div>
    </Card>
  );
}
```

Create **`src/features/dashboard/components/DepartmentChart.jsx`**:

```jsx
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_PRIMARY, TOOLTIP_STYLE } from "../chartTheme";

// "Human Resources" → "Human", so the axis labels fit.
const shortLabel = (name) => name.split(" ")[0];

export function DepartmentChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="name" tickFormatter={shortLabel} tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "var(--color-surface-muted)" }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Employees" fill={CHART_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

Create **`src/features/dashboard/components/StatusChart.jsx`**:

```jsx
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_COLORS, TOOLTIP_STYLE } from "../chartTheme";

/** data: [{ status, label, count }] */
export function StatusChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

Create **`src/features/dashboard/components/HiresChart.jsx`**:

```jsx
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_PRIMARY, TOOLTIP_STYLE } from "../chartTheme";

/** data: [{ month: "2026-01", label: "Jan", count }] */
export function HiresChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="hiresFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="count" name="New hires" stroke={CHART_PRIMARY} strokeWidth={2} fill="url(#hiresFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### 15.5 The dashboard page

Replace **`src/features/dashboard/pages/DashboardPage.jsx`**:

```jsx
import { useMemo } from "react";
import { Link } from "react-router";
import { Building2, CalendarClock, UserCheck, UserMinus, Users, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useAuthStore } from "@/features/auth/authStore";
import { usePermission } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { EMPLOYEE_STATUS_OPTIONS, labelFor } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { ChartCard } from "../components/ChartCard";
import { DepartmentChart } from "../components/DepartmentChart";
import { HiresChart } from "../components/HiresChart";
import { StatCard } from "../components/StatCard";
import { StatusChart } from "../components/StatusChart";
import { useDashboardStats } from "../queries";

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "short" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const firstName = useAuthStore((state) => state.user?.first_name);
  const canViewActivity = usePermission("activity.view");
  const canReviewLeave = usePermission("leaves.review");
  const { data: stats, isPending, isError, error, refetch, dataUpdatedAt } = useDashboardStats();

  // Derived chart data. useMemo keeps the SAME array while `stats` is unchanged (and thanks
  // to structural sharing, polling doesn't change it), so charts don't redraw needlessly.
  const statusData = useMemo(
    () => (stats?.by_status ?? []).map((row) => ({ ...row, label: labelFor(EMPLOYEE_STATUS_OPTIONS, row.status) })),
    [stats?.by_status],
  );
  const hiresData = useMemo(
    () =>
      (stats?.hires_by_month ?? []).map((row) => {
        const [year, month] = row.month.split("-").map(Number);
        return { ...row, label: monthFormatter.format(new Date(year, month - 1, 1)) };
      }),
    [stats?.hires_by_month],
  );

  const header = (
    <PageHeader
      title="Dashboard"
      description={`${greeting()}${firstName ? `, ${firstName}` : ""}. Here's what's happening at your company.`}
      actions={dataUpdatedAt > 0 && <span className="text-xs text-fg-muted">Updated {formatRelative(new Date(dataUpdatedAt).toISOString())}</span>}
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <Card>
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total employees" value={stats.total_employees} icon={Users} to="/employees" />
        <StatCard label="Active" value={stats.active_employees} icon={UserCheck} tone="green" to="/employees?status=ACTIVE" />
        <StatCard label="Inactive" value={stats.inactive_employees} icon={UserX} tone="gray" to="/employees?status=INACTIVE" />
        <StatCard label="On leave" value={stats.on_leave_employees} icon={UserMinus} tone="yellow" to="/employees?status=ON_LEAVE" />
        <StatCard label="Departments" value={stats.total_departments} icon={Building2} to="/departments" />
        <StatCard
          label="Pending leave requests"
          value={stats.pending_leaves}
          icon={CalendarClock}
          tone="red"
          to={canReviewLeave ? "/leaves/approvals" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Employees by department">
          <DepartmentChart data={stats.by_department} />
        </ChartCard>
        <ChartCard title="Employment status">
          <StatusChart data={statusData} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className={canViewActivity ? "lg:col-span-2" : "lg:col-span-3"}>
          <ChartCard title="New hires" description="Last 12 months">
            <HiresChart data={hiresData} />
          </ChartCard>
        </div>
        {canViewActivity && (
          <Card>
            <CardHeader
              title="Recent activity"
              actions={
                <Link to="/employees" className="text-sm text-indigo-600 hover:underline">
                  Directory
                </Link>
              }
            />
            <ActivityFeed items={stats.recent_activity} />
          </Card>
        )}
      </div>
    </>
  );
}
```

### 15.6 How it works

- One request feeds the whole page. The server aggregates, and the client only reshapes the data (adding labels).
- `StatCard` links use URL filters from Phase 11: clicking **Inactive** opens `/employees?status=INACTIVE`, pre-filtered. That's URL state paying off.
- Role-aware layout: employees don't get the activity feed (the API returns an empty list for them anyway), and the hires chart spans the full width instead.
- `refetchInterval` keeps numbers fresh. Change an employee's status in another tab and, within a minute, the dashboard updates. The Phase 12 mutations also invalidate `["dashboard"]`, so changes made in this tab show up immediately.

### 15.7 Exercises

1. Add a "Leave requests by type" bar chart. Add the aggregate to the backend view first.
2. Add a date-range selector (3/6/12 months) for the hires chart. Put the range in the query key: `queryKeys.dashboard.stats(range)`.
3. Make the bars clickable: navigate to `/employees?department=<id>`. (Hint: return `id` from the API and use `useNavigate` in an `onClick` on `<Bar>`.)

### 15.8 Common mistakes

> ⚠️ **`ResponsiveContainer` inside a parent with no height** renders a 0px chart. Give the parent an explicit height.

> ⚠️ **Computing aggregates on the client from paginated data.** You only have one page. Aggregate on the server.

### 15.9 Checkpoint

You can explain polling vs invalidation, structural sharing, why the chart data is memoised, and how URL filters make dashboard cards actionable.

---

<a id="phase-16"></a>

## Phase 16: User and Role Management

### 16.1 Learning objectives

- Build an admin-only feature end to end.
- Use **`useDeferredValue`** to keep typing responsive while a large list re-renders.
- Build schemas that change with context: create vs edit.
- Visualise the permission model.

### 16.2 `useDeferredValue`

| | |
|---|---|
| **Problem it solves** | Typing in an input that filters a big, slow-to-render list makes keystrokes lag. |
| **How it works** | `const deferred = useDeferredValue(value)` lags behind `value`. React first re-renders with the **old** deferred value (fast, so the input stays snappy), then re-renders in the background with the new one, and abandons that work if another keystroke arrives. |
| **Use it when** | The expensive part is **rendering** derived from a value, especially when you don't control where the state is set (it comes from props). |
| **Don't use it when** | The cost is a network request (debounce instead; deferring doesn't reduce requests), or the render is already cheap. |
| **vs `useTransition`** | `useTransition` wraps the **state update** you control. `useDeferredValue` wraps a **value** you receive. |
| **vs debouncing** | Debouncing waits a fixed time. Deferring has no fixed delay, adapts to device speed, and can be interrupted. |

### 16.3 Data layer

Create **`src/features/users/api.js`**:

```js
import { apiClient } from "@/lib/apiClient";

export const usersApi = {
  list: async ({ signal } = {}) => (await apiClient.get("/users/", { signal })).data, // array, not paginated
  create: async (data) => (await apiClient.post("/users/", data)).data,
  update: async (id, data) => (await apiClient.patch(`/users/${id}/`, data)).data,
  remove: async (id) => {
    await apiClient.delete(`/users/${id}/`);
  },
};
```

Create **`src/features/users/queries.js`**:

```js
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { usersApi } from "./api";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: ({ signal }) => usersApi.list({ signal }),
  });
}
```

Create **`src/features/users/mutations.js`**:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { usersApi } from "./api";

export function useSaveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? usersApi.update(id, data) : usersApi.create(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}
```

Create **`src/features/users/schemas.js`**:

```js
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

const baseUserSchema = z.object({
  email: z.email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(150)
    .regex(/^[\w.@+-]+$/, "Letters, numbers and @ . + - _ only"),
  first_name: z.string().trim().min(1, "First name is required").max(150),
  last_name: z.string().trim().min(1, "Last name is required").max(150),
  role: z.enum(["ADMIN", "HR", "EMPLOYEE"], { error: "Choose a role" }),
  phone: z.string().trim().max(30),
  is_active: z.boolean(),
});

/** Password is required when creating, optional ("keep current") when editing. */
export function makeUserSchema({ isEdit }) {
  return baseUserSchema.extend({
    password: isEdit
      ? z.string().refine((value) => value === "" || value.length >= MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
      : z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
  });
}

export const USER_FIELD_NAMES = ["email", "username", "first_name", "last_name", "role", "phone", "is_active", "password"];
```

### 16.4 Components

Create **`src/features/users/components/RoleBadge.jsx`**:

```jsx
import { Badge } from "@/components/ui/Badge";
import { ROLE_OPTIONS, labelFor } from "@/lib/constants";

const ROLE_TONES = { ADMIN: "indigo", HR: "blue", EMPLOYEE: "gray" };

export function RoleBadge({ role }) {
  return <Badge tone={ROLE_TONES[role]}>{labelFor(ROLE_OPTIONS, role)}</Badge>;
}
```

Create **`src/features/users/components/UserTable.jsx`**:

```jsx
import { memo } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { RoleBadge } from "./RoleBadge";

/**
 * memo matters here: while the deferred search catches up, the parent re-renders
 * with the OLD filtered list. memo lets that render skip the table entirely,
 * which is what keeps typing fast.
 */
export const UserTable = memo(function UserTable({ users, currentUserId, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">User</th>
            <th scope="col" className="px-5 py-3 font-medium">Role</th>
            <th scope="col" className="px-5 py-3 font-medium">Status</th>
            <th scope="col" className="px-5 py-3 font-medium">Joined</th>
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium">
                        {user.full_name}
                        {isSelf && <span className="ml-2 text-xs text-fg-muted">(you)</span>}
                      </p>
                      <p className="text-xs text-fg-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3">{user.is_active ? <Badge tone="green">Active</Badge> : <Badge>Deactivated</Badge>}</td>
                <td className="px-5 py-3 whitespace-nowrap">{formatDate(user.date_joined)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${user.full_name}`} onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isSelf}
                      aria-label={user.is_active ? `Deactivate ${user.full_name}` : `Activate ${user.full_name}`}
                      onClick={() => onToggleActive(user)}
                    >
                      <Power className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" disabled={isSelf} aria-label={`Delete ${user.full_name}`} onClick={() => onDelete(user)}>
                      <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
```

Create **`src/features/users/components/UserFormModal.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/features/auth/authStore";
import { setFormErrors } from "@/lib/apiErrors";
import { ROLE_OPTIONS, ROLES } from "@/lib/constants";
import { useSaveUser } from "../mutations";
import { USER_FIELD_NAMES, makeUserSchema } from "../schemas";

/** `user` = the account to edit, or null to create one. */
export function UserFormModal({ isOpen, onClose, user }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit user" : "New user"} size="lg">
      <UserForm user={user} onDone={onClose} />
    </Modal>
  );
}

function UserForm({ user, onDone }) {
  const isEdit = Boolean(user);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isSelf = isEdit && user.id === currentUserId;
  const saveUser = useSaveUser();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(makeUserSchema({ isEdit })),
    defaultValues: {
      email: user?.email ?? "",
      username: user?.username ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      role: user?.role ?? ROLES.EMPLOYEE,
      phone: user?.phone ?? "",
      is_active: user?.is_active ?? true,
      password: "",
    },
  });

  async function onSubmit(values) {
    // Editing with an empty password means "keep the current one": don't send the field at all.
    const { password, ...rest } = values;
    const data = password ? values : rest;
    try {
      const saved = await saveUser.mutateAsync({ id: user?.id, data });
      toast.success(isEdit ? `${saved.full_name} was updated.` : `${saved.full_name} can now sign in.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, USER_FIELD_NAMES);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" required error={errors.first_name?.message} {...register("first_name")} />
        <TextField label="Last name" required error={errors.last_name?.message} {...register("last_name")} />
        <TextField label="Email" type="email" required error={errors.email?.message} {...register("email")} />
        <TextField label="Username" required error={errors.username?.message} {...register("username")} />
        {isSelf ? (
          // Not registered: RHF still submits the default value (the current role) unchanged.
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Role</p>
            <p className="text-sm text-fg-muted">You can't change your own role.</p>
          </div>
        ) : (
          <SelectField label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register("role")} />
        )}
        <TextField label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
        <TextField
          label={isEdit ? "New password" : "Password"}
          type="password"
          autoComplete="new-password"
          required={!isEdit}
          hint={isEdit ? "Leave blank to keep the current password." : "At least 8 characters."}
          error={errors.password?.message}
          {...register("password")}
          className="sm:col-span-2"
        />
      </div>
      {!isSelf && <CheckboxField label="Active" description="Inactive users can't sign in." {...register("is_active")} />}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
```

> **Why not just `disabled` the role select for yourself?** React Hook Form treats disabled fields as having **no value**, so Zod would reject the missing `role` and the form could never submit. Leaving the field unregistered keeps its default value (your current role) in the submitted data, which the API accepts unchanged.

Create **`src/features/users/components/PermissionMatrix.jsx`**:

```jsx
import { Check, Minus } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PERMISSIONS } from "@/features/auth/permissions";
import { ROLE_OPTIONS } from "@/lib/constants";

const PERMISSION_LABELS = {
  "employees.manage": "Create and edit employees",
  "employees.delete": "Delete employees",
  "employees.viewHistory": "View employee leave and activity history",
  "departments.manage": "Manage departments",
  "leaves.review": "Approve or reject leave",
  "activity.view": "View the activity feed",
  "users.manage": "Manage user accounts and roles",
  "leaves.request": "Request leave",
};

/** Rendered straight from the PERMISSIONS map: the docs can never drift from the code. */
export function PermissionMatrix() {
  return (
    <Card>
      <CardHeader title="Role permissions" description="What each role can do in PeopleDesk." />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-muted/50 text-xs tracking-wide text-fg-muted uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 text-left font-medium">Permission</th>
              {ROLE_OPTIONS.map((role) => (
                <th key={role.value} scope="col" className="px-5 py-3 text-center font-medium">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {Object.entries(PERMISSIONS).map(([permission, roles]) => (
              <tr key={permission}>
                <td className="px-5 py-3">{PERMISSION_LABELS[permission] ?? permission}</td>
                {ROLE_OPTIONS.map((role) => (
                  <td key={role.value} className="px-5 py-3 text-center">
                    {roles.includes(role.value) ? (
                      <Check className="mx-auto h-4 w-4 text-green-600" aria-label="Allowed" />
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-fg-muted" aria-label="Not allowed" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

### 16.5 The users page

Replace **`src/features/users/pages/UsersPage.jsx`**:

```jsx
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/features/auth/authStore";
import { getErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/cn";
import { ROLE_OPTIONS } from "@/lib/constants";
import { PermissionMatrix } from "../components/PermissionMatrix";
import { UserFormModal } from "../components/UserFormModal";
import { UserTable } from "../components/UserTable";
import { useDeleteUser, useSaveUser } from "../mutations";
import { useUsers } from "../queries";

export default function UsersPage() {
  const { data: users, isPending, isError, error, refetch } = useUsers();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { mutate: saveUser } = useSaveUser();
  const deleteUser = useDeleteUser();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formState, setFormState] = useState(null); // null | { user: null | User }
  const [userToDelete, setUserToDelete] = useState(null);

  // The input always shows `search` (urgent). The list filters by `deferredSearch`,
  // which catches up in a background render that the next keystroke can interrupt.
  const deferredSearch = useDeferredValue(search);
  const isStale = search !== deferredSearch;

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return (users ?? []).filter(
      (user) =>
        (!roleFilter || user.role === roleFilter) &&
        (!query || user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)),
    );
  }, [users, deferredSearch, roleFilter]);

  // Stable callbacks, so the memoised UserTable can skip renders.
  const handleEdit = useCallback((user) => setFormState({ user }), []);
  const handleToggleActive = useCallback(
    (user) =>
      saveUser(
        { id: user.id, data: { is_active: !user.is_active } },
        {
          onSuccess: (saved) => toast.success(`${saved.full_name} was ${saved.is_active ? "activated" : "deactivated"}.`),
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      ),
    [saveUser, toast],
  );

  function handleConfirmDelete() {
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`${userToDelete.full_name}'s account was deleted.`);
        setUserToDelete(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  let content;
  if (isPending) content = <TableSkeleton rows={6} columns={5} />;
  else if (isError) content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  else if (filteredUsers.length === 0) content = <EmptyState icon={ShieldCheck} title="No users match" />;
  else
    content = (
      <div className={cn("transition-opacity", isStale && "opacity-60")}>
        <UserTable
          users={filteredUsers}
          currentUserId={currentUserId}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={setUserToDelete}
        />
      </div>
    );

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Control who can sign in and what they can do."
        actions={
          <Button leftIcon={UserPlus} onClick={() => setFormState({ user: null })}>
            New user
          </Button>
        }
      />
      <Card className="mb-6">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" label="Search users" className="sm:max-w-sm sm:flex-1" />
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-lg border border-line bg-surface px-3 text-sm shadow-sm"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        {content}
      </Card>

      <PermissionMatrix />

      <UserFormModal isOpen={formState !== null} onClose={() => setFormState(null)} user={formState?.user ?? null} />
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteUser.isPending}
        title="Delete user account?"
        message={`${userToDelete?.full_name ?? "This user"} will no longer be able to sign in. Their employee record (if any) is kept.`}
        confirmLabel="Delete account"
      />
    </>
  );
}
```

### 16.6 Try it

As Admin: create an HR user, sign in as them in a private window, deactivate them as Admin, and watch their next request fail. Their token refresh is rejected for an inactive user, and they're sent to the login page.

To *feel* `useDeferredValue`, open DevTools → Performance → CPU: **6× slowdown**, add a few hundred users with a loop in the Django shell, and type quickly. The input stays responsive while the list catches up, dimmed.

### 16.7 Exercises

1. Add "Link to employee" to the user form: a select of employees without a user, saved through a new backend field on `UserSerializer`.
2. Replace `useDeferredValue` with a 300 ms `useDebounce` and compare the feel on a fast and a throttled CPU.
3. Prevent the last remaining admin from being demoted, on the backend and in the UI.

### 16.8 Common mistakes

> ⚠️ **Expecting `useDeferredValue` to make the slow component faster.** It only changes *when* it renders. Combine it with `memo` so the "old value" render can skip the slow child.

> ⚠️ **One schema for create and edit** with an optional password. Then create mode accepts users with no password. Build the schema from the context.

### 16.9 Checkpoint

You can explain `useDeferredValue` vs `useTransition` vs debouncing, build context-dependent schemas, and keep admin-only features safe on both sides of the API.

---

<a id="phase-17"></a>

## Phase 17: Settings and Profile

### 17.1 Learning objectives

- Update the **session user** after a profile change, keeping global state in sync with the server.
- Build a password form with cross-field rules and server errors.
- Contrast **"save" forms** with **instant-apply preferences**.
- Keep the active settings tab in the URL.

### 17.2 Schemas and mutations

Create **`src/features/settings/schemas.js`**:

```js
import { z } from "zod";

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(150),
  last_name: z.string().trim().min(1, "Last name is required").max(150),
  phone: z.string().trim().max(30, "Keep it under 30 characters"),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ["confirm_password"],
    error: "Passwords don't match",
  })
  .refine((values) => values.new_password !== values.current_password, {
    path: ["new_password"],
    error: "Choose a password different from your current one",
  });
```

Create **`src/features/settings/mutations.js`**:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/authStore";
import { queryKeys } from "@/lib/queryKeys";

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (user) => {
      setUser(user); // the top bar name updates immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (data) => authApi.changePassword(data) });
}
```

### 17.3 Forms

Create **`src/features/settings/components/ProfileForm.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/authStore";
import { setFormErrors } from "@/lib/apiErrors";
import { useUpdateProfile } from "../mutations";
import { profileSchema } from "../schemas";

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user.first_name, last_name: user.last_name, phone: user.phone ?? "" },
  });

  async function onSubmit(values) {
    try {
      const saved = await updateProfile.mutateAsync(values);
      // Make the saved values the new baseline, so isDirty goes back to false.
      reset({ first_name: saved.first_name, last_name: saved.last_name, phone: saved.phone ?? "" });
      toast.success("Your profile was updated.");
    } catch (error) {
      setFormErrors(error, setError, ["first_name", "last_name", "phone"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-5 p-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.full_name} size="lg" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-fg-muted">{user.email}</p>
        </div>
      </div>
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" required error={errors.first_name?.message} {...register("first_name")} />
        <TextField label="Last name" required error={errors.last_name?.message} {...register("last_name")} />
      </div>
      <TextField label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
      <TextField label="Email" value={user.email} readOnly disabled hint="Contact an administrator to change your email." />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
```

Create **`src/features/settings/components/ChangePasswordForm.jsx`**:

```jsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { setFormErrors } from "@/lib/apiErrors";
import { useChangePassword } from "../mutations";
import { passwordSchema } from "../schemas";

const EMPTY_PASSWORDS = { current_password: "", new_password: "", confirm_password: "" };

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY_PASSWORDS });

  async function onSubmit({ current_password, new_password }) {
    try {
      // confirm_password is a client-only field: the API never sees it.
      await changePassword.mutateAsync({ current_password, new_password });
      reset(EMPTY_PASSWORDS);
      toast.success("Your password was changed.");
    } catch (error) {
      // e.g. {"current_password": ["Your current password is incorrect."]}
      setFormErrors(error, setError, ["current_password", "new_password"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md space-y-4 p-6">
      <FormError message={errors.root?.serverError?.message} />
      <TextField label="Current password" type="password" autoComplete="current-password" required error={errors.current_password?.message} {...register("current_password")} />
      <TextField label="New password" type="password" autoComplete="new-password" required error={errors.new_password?.message} {...register("new_password")} />
      <TextField label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirm_password?.message} {...register("confirm_password")} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Change password
        </Button>
      </div>
    </form>
  );
}
```

Create **`src/features/settings/components/PreferencesForm.jsx`**. There's no submit button: each control writes straight to the store. These are **controlled inputs bound to global state**.

```jsx
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { useUiStore } from "@/stores/uiStore";

const THEME_CHOICES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];
const DENSITY_CHOICES = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

function ChoiceGroup({ legend, name, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map(({ value: optionValue, label, icon: Icon }) => (
          <label
            key={optionValue}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm has-focus-visible:outline-2 has-focus-visible:outline-indigo-600",
              value === optionValue ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-line hover:bg-surface-muted",
            )}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="sr-only"
            />
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PreferencesForm() {
  const theme = useUiStore((state) => state.theme);
  const density = useUiStore((state) => state.density);
  const pageSize = useUiStore((state) => state.pageSize);
  const setTheme = useUiStore((state) => state.setTheme);
  const setDensity = useUiStore((state) => state.setDensity);
  const setPageSize = useUiStore((state) => state.setPageSize);

  return (
    <div className="max-w-xl space-y-6 p-6">
      <p className="text-sm text-fg-muted">Preferences are saved on this device and apply instantly.</p>
      <ChoiceGroup legend="Theme" name="theme" value={theme} options={THEME_CHOICES} onChange={setTheme} />
      <ChoiceGroup legend="Table density" name="density" value={density} options={DENSITY_CHOICES} onChange={setDensity} />
      <label className="block max-w-xs">
        <span className="text-sm font-medium">Default rows per page</span>
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          className="mt-2 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
```

### 17.4 The settings page with the tab in the URL

Replace **`src/features/settings/pages/SettingsPage.jsx`**:

```jsx
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { PreferencesForm } from "../components/PreferencesForm";
import { ProfileForm } from "../components/ProfileForm";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
];
const TAB_IDS = TABS.map((tab) => tab.id);

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  // Never trust the URL: fall back to a known tab.
  const activeTab = TAB_IDS.includes(requestedTab) ? requestedTab : "profile";

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, password and preferences." />
      <Card>
        <div className="px-4">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={(tab) => setSearchParams({ tab }, { replace: true })} label="Settings sections" />
        </div>
        <div role="tabpanel">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "security" && <ChangePasswordForm />}
          {activeTab === "preferences" && <PreferencesForm />}
        </div>
      </Card>
    </>
  );
}
```

### 17.5 How it connects

- `/settings?tab=security` is now linkable. You could point a "Password expires soon" banner straight at it.
- The profile mutation writes the server's response into the Zustand session, and the `UserMenu` (subscribed to `state.user`) re-renders with the new name. That's global client state kept in sync with server state at the one place they meet.
- Changing **Default rows per page** changes `useUiStore().pageSize`, which `useEmployeeFilters` uses when the URL has no `page_size`.

> **Security note.** SimpleJWT access tokens stay valid after a password change until they expire. For stricter setups, rotate a per-user "token version" claim on password change, or blacklist the user's outstanding refresh tokens.

### 17.6 Exercises

1. After a password change, log the user out of all other sessions (backend: blacklist the user's outstanding tokens with `OutstandingToken`).
2. Add a "Notifications" preferences section stored on the server (new model + endpoint), using `useQuery` + `useMutation`. Compare it with the localStorage approach.
3. Warn about unsaved profile changes when switching tabs, using `isDirty` and `window.confirm`.

### 17.7 Checkpoint

You can update global session state from a mutation, build a password form with cross-field rules, explain when a preference should save instantly vs on submit, and keep UI state like tabs in the URL safely.

---

<a id="phase-18"></a>

## Phase 18: Performance Optimisation

### 18.1 Learning objectives

- Understand exactly **why** components re-render, and measure it with the **React DevTools Profiler**.
- Use `React.memo`, `useMemo` and `useCallback` deliberately, not by default.
- Apply **code splitting** with `React.lazy` and `Suspense` at the route level.
- Choose between debouncing, throttling, deferring and virtualisation.

### 18.2 Why components re-render

A component re-renders when:

1. **Its state changes** (`useState`, `useReducer`).
2. **Its parent re-renders.** By default, React re-renders all children, whether or not their props changed.
3. **A context it consumes changes value.**
4. **An external store it subscribes to changes the selected slice** (Zustand, `useSyncExternalStore`).

"Props changed" is **not** on the list. Props are only compared when a component is wrapped in `memo`.

**Your first optimisation is structure, not memo:**

- **Colocate state.** `EmployeeFilters` holds the typed search text, so each keystroke re-renders only `EmployeeFilters`, not the table. If that state lived in `EmployeesPage`, every keystroke would re-render every row.
- **Lift content up through `children`.** A component that re-renders often but receives `children` doesn't re-render those children, because they were created by its parent.
- **Split contexts** (like the toast API vs the toast list).

### 18.3 Measuring with the Profiler

1. Open React DevTools → ⚙️ Settings → **Profiler** → enable **"Record why each component rendered while profiling"**. In **General**, enable **"Highlight updates when components render"**.
2. Go to **Employees** as HR. Open the **Profiler** tab and click record.
3. Change **one** employee's status in the table. Stop recording.
4. In the flame chart, find the `EmployeeRow`s. **Only the changed row** rendered. The others are grey, marked "Did not render". Hover one that did render to see why ("Props changed: employee").

Now break it on purpose to see the difference.

**Experiment A: remove `memo`.** In `src/features/employees/components/EmployeeRow.jsx`, change the first line of the component from:

```jsx
export const EmployeeRow = memo(function EmployeeRow({
```

to:

```jsx
export const EmployeeRow = (function EmployeeRow({
```

Record the same interaction. Now **every** row renders several times: the optimistic update, `isFetching` going true and then false, and the refetch result. Restore `memo(`.

**Experiment B: break referential stability.** In `EmployeesPage.jsx`, replace `onStatusChange={handleStatusChange}` with an inline arrow:

```jsx
onStatusChange={(id, status) => handleStatusChange(id, status)}
```

Record again. Every row re-renders, and the Profiler explains why: **"Props changed: onStatusChange"**. A new function on every render defeats `memo`. Restore the original line.

**Experiment C: make the cost visible.** Temporarily add this as the first line inside `EmployeeRow` to simulate a slow row, set rows-per-page to 50, then repeat A:

```jsx
const slowUntil = performance.now() + 2; while (performance.now() < slowUntil) {} // ~2 ms per row (remove after!)
```

50 rows × 2 ms × several renders turns into a visibly laggy select. That's what `memo` + `useCallback` buy you. Remove the line.

### 18.4 `React.memo`, `useMemo` and `useCallback` properly

| Tool | What it does | Use when | Pitfalls |
|---|---|---|---|
| `memo(Component)` | Skips re-rendering if props are shallowly equal | The component renders often with the same props **and** rendering is measurably expensive (rows, charts, big lists) | Useless if any prop is a new object, array or function each render, including `children` |
| `useMemo(fn, deps)` | Caches a computed value | (1) An expensive calculation, (2) keeping a reference stable for `memo` children, effect deps or query keys | Adds overhead and complexity; don't wrap cheap expressions |
| `useCallback(fn, deps)` | Caches a function identity | Passing callbacks to `memo` children or using them as effect deps | Pointless if the receiver isn't memoised and doesn't use it as a dependency |

Where PeopleDesk uses them, and why:

| Code | Why it's justified |
|---|---|
| `EmployeeRow` with `memo` | Many rows; most don't change on a status update or a background refetch |
| `handleStatusChange` with `useCallback` | A prop of the memoised row |
| `filters` with `useMemo` in `useEmployeeFilters` | Used in a query key and as an effect dependency (prefetching) |
| `UserTable` with `memo` + `useDeferredValue` | Lets the deferred render skip the table |
| Toast `api` with `useMemo` | A context value: a new object would re-render every consumer |
| Dashboard chart data with `useMemo` | Keeps chart inputs stable between polls |

> **The React Compiler.** React Compiler 1.0 can add memoisation automatically at build time. With it enabled, most manual `memo`/`useMemo`/`useCallback` calls become unnecessary. To try it: `npm install -D babel-plugin-react-compiler`, then in `vite.config.js` use `react({ babel: { plugins: ["babel-plugin-react-compiler"] } })`. Interviews still expect you to understand manual memoisation, and the compiler only works well on code that follows the Rules of React, which is everything this guide teaches.

> 💡 **Interview question: "Should you wrap everything in `useMemo`/`useCallback`?"** No. They cost memory and comparisons and make code harder to read. Measure first, fix structure first (colocate state, pass `children`), then memoise the specific hot path.

### 18.5 Code splitting with `React.lazy` and `Suspense`

Right now every page ships in one JavaScript bundle, including Recharts, which only the dashboard uses. **Route-level code splitting** downloads each page's code only when it's visited.

- `lazy(() => import("./Page"))` returns a component that **suspends** until the module loads. The dynamic `import()` tells Vite to put that module in its own chunk.
- The nearest `<Suspense fallback>` above it shows the fallback meanwhile.
- `lazy` requires the module's **default export** to be a component. That's why pages use `export default`.

Run a build first to see the "before":

```bash
npm run build
```

Note the single large `index-*.js` chunk. Now replace **`src/app/AppRoutes.jsx`** (version 3, final):

```jsx
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { FullPageLoader } from "@/components/feedback/Loaders";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleRoute } from "@/features/auth/components/RoleRoute";

// Each lazy() call becomes a separate chunk, downloaded on first visit.
// Layouts and guards stay eager: they're needed on every page.
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const EmployeesPage = lazy(() => import("@/features/employees/pages/EmployeesPage"));
const EmployeeDetailPage = lazy(() => import("@/features/employees/pages/EmployeeDetailPage"));
const EmployeeCreatePage = lazy(() => import("@/features/employees/pages/EmployeeCreatePage"));
const EmployeeEditPage = lazy(() => import("@/features/employees/pages/EmployeeEditPage"));
const DepartmentsPage = lazy(() => import("@/features/departments/pages/DepartmentsPage"));
const DepartmentDetailPage = lazy(() => import("@/features/departments/pages/DepartmentDetailPage"));
const MyLeavesPage = lazy(() => import("@/features/leaves/pages/MyLeavesPage"));
const LeaveApprovalsPage = lazy(() => import("@/features/leaves/pages/LeaveApprovalsPage"));
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export function AppRoutes() {
  return (
    // Outer boundary: covers pages outside AppLayout (the login page).
    // Inside the app, AppLayout's own Suspense catches pages first, so the sidebar
    // and top bar stay visible while a page chunk loads.
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="employees">
              <Route index element={<EmployeesPage />} />
              <Route path=":employeeId" element={<EmployeeDetailPage />} />
              <Route element={<RoleRoute permission="employees.manage" />}>
                <Route path="new" element={<EmployeeCreatePage />} />
                <Route path=":employeeId/edit" element={<EmployeeEditPage />} />
              </Route>
            </Route>

            <Route path="departments">
              <Route index element={<DepartmentsPage />} />
              <Route path=":departmentId" element={<DepartmentDetailPage />} />
            </Route>

            <Route path="leaves">
              <Route index element={<MyLeavesPage />} />
              <Route element={<RoleRoute permission="leaves.review" />}>
                <Route path="approvals" element={<LeaveApprovalsPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute permission="users.manage" />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
```

Build again:

```bash
npm run build
```

You'll now see one chunk per page, and Recharts lives in the dashboard's chunk. Users who never open the dashboard never download it. To inspect bundle contents visually:

```bash
npx vite-bundle-visualizer
```

**How the two Suspense boundaries work.** When a lazy component suspends, React shows the fallback of the **nearest** `Suspense` above it. Pages inside `AppLayout` hit the layout's boundary (a small spinner in the content area). The login page has no layout boundary, so it hits the outer one (full screen). Navigations in React Router v7 run as **transitions**, so after the first load React often keeps the previous page on screen until the next chunk is ready, instead of flashing the fallback.

### 18.6 Choosing the right tool for "too much work"

| Problem | Tool | In PeopleDesk |
|---|---|---|
| Too many **requests** from fast input | **Debounce** | Employee search, assign-employee search |
| Too many **events** from continuous input (scroll, resize) | **Throttle** | `useScrolled` for the top bar shadow |
| Expensive **render** blocking input | `useDeferredValue` / `useTransition` | Users list, profile tabs |
| Too many **DOM nodes** (thousands of rows) | **Virtualisation** (`@tanstack/react-virtual`): render only the visible rows | Not needed thanks to server pagination; consider it for "show all" views |
| Large **bundle** | Route-level `lazy` + `Suspense` | All pages |
| Repeat **network work** | Caching, `staleTime`, prefetching | TanStack Query everywhere |

### 18.7 More optimisations you can apply

- Add `loading="lazy"` and `decoding="async"` to the `<img>` in `Avatar` so offscreen photos load later.
- **Preload on intent**: call `import("@/features/employees/pages/EmployeesPage")` in a `NavLink`'s `onMouseEnter`. The browser caches modules, so `lazy` resolves instantly afterwards.
- Keep keys stable in lists (Phase 5). Unstable keys force remounts, which are far more expensive than re-renders.

### 18.8 Debugging scenario: "the page re-renders forever"

Symptom: the Network tab shows `/employees/` requested in a loop.

Investigation, the way an experienced developer would approach it:

1. Profiler → which component renders repeatedly? `EmployeesPage`.
2. Why? "Hook changed". The query key changes on every render.
3. Look at the key: `useEmployees({ ...filters, extra: [] })`. Hashing ignores object identity, so that's fine. But `useEmployees({ ...filters, since: new Date() })` puts a different timestamp in the key on every render.
4. Fix: make key inputs serialisable and stable (`since: "2026-01-01"`), or compute them once with `useMemo` or `useState(() => ...)`.

The same investigation applies to `useEffect` loops: an object or function dependency recreated every render, or an effect that sets state that one of its own dependencies derives from.

### 18.9 Exercises

1. Record a Profiler session while typing in the users search on a 6× throttled CPU. Compare the commit durations with and without `useDeferredValue`.
2. Preload the Employees page chunk when hovering its sidebar link.
3. Find a `useMemo` or `useCallback` in the codebase that you could safely remove, and explain why it's not pulling its weight.

### 18.10 Common mistakes

> ⚠️ **Optimising without measuring.** Most re-renders are cheap. Profile first.

> ⚠️ **Lazy-loading tiny components** (buttons, icons). Each chunk costs a request. Split at routes and big, rarely used features.

> ⚠️ **`lazy()` inside a component body** creates a new lazy component on every render, which remounts it and loses its state. Declare it at module level.

### 18.11 Checkpoint

You can list the four causes of re-renders, read a Profiler flame chart and its "why did this render" reasons, justify each memoisation in the codebase, explain how `lazy` + `Suspense` split bundles and which boundary catches a suspension, and choose between debounce, throttle, defer and virtualise.

---

<a id="phase-19"></a>

## Phase 19: Error Boundaries, Resilience and Async UI States

### 19.1 Learning objectives

- Know exactly which errors each mechanism catches: error boundaries, `try/catch`, query error states.
- Handle network failures, offline mode and retries deliberately.
- Map the component lifecycle onto hooks.
- Run through a checklist of every async UI state.

### 19.2 Which mechanism catches which error?

| Where the error happens | Caught by | PeopleDesk example |
|---|---|---|
| During **render** (a bug like `employee.name.first` on `undefined`) | **Error boundary** | `ErrorBoundary` around the outlet in `AppLayout` |
| In an **event handler** | `try/catch` in the handler (boundaries don't see it) | `onSubmit` handlers catching `mutateAsync` errors |
| In **async code** (fetches, timers) | Promise handling: `.catch`, `try/await` | Axios interceptors, `logout()` |
| In a **query or mutation** | TanStack Query's `isError`/`error`, `onError` | `ErrorState` with "Try again", toast on mutation failure |
| **Unknown routes** | `path="*"` | `NotFoundPage` |
| **Forbidden routes** | Route guard | `RoleRoute` → `ForbiddenPage` |

**Try the boundary.** Temporarily add `throw new Error("Test crash")` at the top of `DepartmentsPage`, open it and see the fallback. The sidebar still works, because the boundary only wraps the outlet. Navigate to another page and the boundary resets (`resetKey={location.pathname}`). Remove the throw.

> **Alternative: let queries throw to a boundary.** TanStack Query can rethrow errors into the nearest error boundary with `throwOnError: true` (or a function such as `(error) => error.response?.status >= 500`). Combine that with `QueryErrorResetBoundary` so the boundary's "Try again" also resets the query. PeopleDesk handles query errors inline instead, because inline `ErrorState`s keep the rest of the page usable. Both approaches are valid, and many apps use boundaries for unexpected 5xx errors and inline states for expected ones.

### 19.3 Network failures and offline behaviour

What already happens in PeopleDesk:

1. **Retries**: `queryClient.js` retries network errors and 5xx twice with exponential backoff, and never retries 4xx or mutations.
2. **Offline**: TanStack Query's default `networkMode: "online"` **pauses** queries while offline (`fetchStatus: "paused"`) and resumes them when the connection returns. `OfflineBanner` tells the user.
3. **Reconnect**: queries refetch automatically when the browser comes back online.
4. **Timeouts**: Axios aborts requests after 15 s, and `getErrorMessage` turns that into "The server took too long to respond."
5. **Cancelled requests**: switching filters quickly aborts the outdated request through the `signal`, which prevents race conditions where an old response overwrites a newer one.

**Try it:** DevTools → Network → **Offline**. Navigate to a page you haven't visited: the skeleton stays and the banner shows. Go back online and the data loads by itself. Now try changing an employee's status while offline. The mutation pauses and is sent when you reconnect.

### 19.4 Component lifecycle in the hooks world

| Class lifecycle | Hooks equivalent |
|---|---|
| `constructor` (initial state) | `useState(initial)` / `useState(() => expensiveInit())` |
| `componentDidMount` | `useEffect(fn, [])` (setup) |
| `componentDidUpdate` (when X changes) | `useEffect(fn, [x])` |
| `componentWillUnmount` | The cleanup function returned by an effect |
| `shouldComponentUpdate` / `PureComponent` | `memo` |
| `getDerivedStateFromProps` | Compute during render, or the guarded set-state-during-render pattern used in `EmployeeFilters` |
| `getDerivedStateFromError` / `componentDidCatch` | Still class-only, which is why `ErrorBoundary` is a class |
| Reading the DOM after paint vs before paint | `useEffect` (after paint) vs `useLayoutEffect` (before paint, e.g. measuring layout) |

> 💡 **Interview question: "What's the difference between `useEffect` and `useLayoutEffect`?"** Both run after React updates the DOM. `useLayoutEffect` runs synchronously **before the browser paints**, so measurements and DOM adjustments don't flicker. It blocks painting, so use it only for that. `useEffect` runs after paint and is the default.

### 19.5 The async UI states checklist

Every data-driven screen in PeopleDesk handles these. Use the list on any feature you build:

| State | How to detect it | What to show |
|---|---|---|
| **Initial loading** | `isPending` | A skeleton shaped like the content (`TableSkeleton`), not a blank page |
| **Error** | `isError` | `ErrorState` with a human message and **Try again** (`refetch`) |
| **Not found / forbidden** | `error.response.status === 404/403` | A specific empty state ("Employee not found") |
| **Empty** | `data.results.length === 0` | `EmptyState`, telling apart "nothing yet" (with a call to action) from "no matches" (with "clear filters") |
| **Success** | data present | The content |
| **Background refresh** | `isFetching && !isPending` | A subtle spinner; never replace the content |
| **Transitioning** | `isPlaceholderData`, `isPending` from `useTransition`, `value !== deferredValue` | Dim the stale content |
| **Mutating** | `isPending` on the mutation, `isSubmitting` on the form | Disable and show a spinner on the button that triggered it |
| **Offline / paused** | `useOnlineStatus()`, `fetchStatus === "paused"` | A banner |

### 19.6 Debugging scenarios

**"The page is white and the console says `Cannot read properties of undefined`."**
A render error outside any error boundary, or data that's `undefined` on first render. Check which component is named in the stack. Did you read `data.results` before checking `isPending`? Add the state branches from 19.5. Optional chaining (`data?.results`) hides symptoms; branching on state fixes the cause.

**"My modal input loses focus on every keystroke."**
Something remounts it, or an effect refocuses it. Typical causes: a component **defined inside another component's body** (a new component type every render, so React remounts it), a `key` that changes each render, or an effect depending on an inline callback (the reason `Modal` uses `useLatest`).

**"Data doesn't update after I save."**
Wrong or missing invalidation. Open React Query Devtools after the mutation: did the relevant key become stale and refetch? Compare the keys character by character (`"7"` vs `7`).

**"It works locally but production shows 404 on refresh."**
SPA fallback isn't configured on the host (Phase 21).

### 19.7 Exercises

1. Report errors from `ErrorBoundary.componentDidCatch` to a fake logging endpoint (a POST to `/api/client-errors/` that you add in Django).
2. Show "Retrying… (attempt 2)" in `ErrorState` using the query's `failureCount`.
3. Make the status `<select>` disabled with a tooltip while offline.

### 19.8 Checkpoint

You can say which mechanism catches each kind of error, describe PeopleDesk's behaviour offline and on slow networks, map lifecycles to hooks, and walk through the async state checklist for any screen.

---

<a id="phase-20"></a>

## Phase 20: Testing with Vitest, React Testing Library and MSW

### 20.1 Learning objectives

- Set up Vitest with jsdom, React Testing Library, user-event and jest-dom.
- Mock the API at the **network level** with MSW (Mock Service Worker).
- Test components, hooks, schemas, permissions, route guards and full user workflows.

### 20.2 What to test, and why

> "The more your tests resemble the way your software is used, the more confidence they can give you." (Testing Library's guiding principle)

| Test | Value | PeopleDesk examples |
|---|---|---|
| **Pure logic** (unit) | Cheap, fast, precise | Zod schemas, `hasPermission`, formatters |
| **Hooks** | Behaviour over time | `useDebounce` with fake timers |
| **Components** | Rendering and interaction | `Button` |
| **Integration** (most valuable) | A page with its real hooks, router and cache; only the network is mocked | Login flow, employee search, delete flow, optimistic rollback, route guards |
| **End-to-end** | The real browser and backend | Out of scope here; see Playwright in Appendix I |

**Test behaviour, not implementation.** Query the DOM the way users and assistive technology do (`getByRole`, `getByLabelText`), interact with `user-event`, and assert on what's visible. Don't assert on state variables, hook calls or CSS classes.

### 20.3 Install and configure

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event msw@2
```

Replace **`vite.config.js`** (final):

```js
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: { port: 5173 },
  test: {
    environment: "jsdom", // a simulated browser DOM in Node
    globals: true, // describe/it/expect/vi without imports; enables RTL's automatic cleanup
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
```

Add scripts to **`package.json`** (keep the existing ones). The `"scripts"` section becomes:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

If ESLint complains that `describe`, `it`, `expect` or `vi` are undefined in test files, add this object to the array in **`eslint.config.js`**, after the existing config entries:

```js
{
  files: ["**/*.test.{js,jsx}", "src/test/**"],
  languageOptions: {
    globals: { ...globals.browser, ...globals.node, describe: "readonly", it: "readonly", expect: "readonly", vi: "readonly", beforeAll: "readonly", beforeEach: "readonly", afterAll: "readonly", afterEach: "readonly" },
  },
},
```

(`globals` is already imported at the top of the Vite template's `eslint.config.js`.)

### 20.4 Test infrastructure

Create **`src/test/fixtures.js`**: realistic data in the same shapes as the API contract.

```js
export const adminUser = {
  id: 1, email: "admin@peopledesk.test", username: "admin", first_name: "Ada", last_name: "Admin",
  full_name: "Ada Admin", role: "ADMIN", phone: "", employee_id: 1,
};
export const hrUser = {
  id: 2, email: "hr@peopledesk.test", username: "hr", first_name: "Harper", last_name: "Reed",
  full_name: "Harper Reed", role: "HR", phone: "", employee_id: 2,
};
export const employeeUser = {
  id: 3, email: "employee@peopledesk.test", username: "employee", first_name: "Evan", last_name: "Stone",
  full_name: "Evan Stone", role: "EMPLOYEE", phone: "", employee_id: 3,
};

export function makeEmployee(overrides = {}) {
  const first_name = overrides.first_name ?? "Test";
  const last_name = overrides.last_name ?? "Person";
  const id = overrides.id ?? 99;
  return {
    id,
    employee_id: `EMP-${String(id).padStart(5, "0")}`,
    user: null,
    first_name,
    last_name,
    full_name: `${first_name} ${last_name}`,
    email: `${first_name}.${last_name}@peopledesk.test`.toLowerCase(),
    phone: "",
    job_title: "Engineer",
    department: 1,
    department_name: "Engineering",
    status: "ACTIVE",
    hire_date: "2025-01-15",
    avatar: null,
    emergency_contacts: [],
    created_at: "2026-01-01T09:00:00Z",
    updated_at: "2026-01-01T09:00:00Z",
    ...overrides,
  };
}

export const employees = [
  makeEmployee({ id: 1, first_name: "Amara", last_name: "Okafor", job_title: "Senior Engineer" }),
  makeEmployee({ id: 2, first_name: "Liam", last_name: "Novak", job_title: "Recruiter", department: 2, department_name: "Human Resources" }),
];

export const departments = [
  { id: 1, name: "Engineering", code: "ENG", description: "", employee_count: 1, created_at: "2026-01-01T09:00:00Z" },
  { id: 2, name: "Human Resources", code: "HR", description: "", employee_count: 1, created_at: "2026-01-01T09:00:00Z" },
];

export function paginate(results) {
  return { count: results.length, next: null, previous: null, results };
}
```

Create **`src/test/handlers.js`**: the default fake API.

```js
import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/apiClient";
import { departments, employees, hrUser, paginate } from "./fixtures";

export const TEST_PASSWORD = "ChangeMe123!";

export const handlers = [
  http.post(`${API_URL}/auth/login/`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === hrUser.email && password === TEST_PASSWORD) {
      return HttpResponse.json({ access: "test-access", refresh: "test-refresh" });
    }
    return HttpResponse.json({ detail: "No active account found with the given credentials" }, { status: 401 });
  }),

  http.get(`${API_URL}/auth/me/`, () => HttpResponse.json(hrUser)),

  http.get(`${API_URL}/departments/`, () => HttpResponse.json(departments)),

  // A tiny fake of DRF's search, so tests can check server-side filtering.
  http.get(`${API_URL}/employees/`, ({ request }) => {
    const search = (new URL(request.url).searchParams.get("search") ?? "").toLowerCase();
    return HttpResponse.json(paginate(employees.filter((employee) => employee.full_name.toLowerCase().includes(search))));
  }),

  http.get(`${API_URL}/employees/:id/`, ({ params }) => {
    const employee = employees.find((item) => String(item.id) === params.id);
    return employee ? HttpResponse.json(employee) : HttpResponse.json({ detail: "Not found." }, { status: 404 });
  }),

  http.patch(`${API_URL}/employees/:id/`, async ({ params, request }) => {
    const employee = employees.find((item) => String(item.id) === params.id);
    return HttpResponse.json({ ...employee, ...(await request.json()) });
  }),

  http.delete(`${API_URL}/employees/:id/`, () => new HttpResponse(null, { status: 204 })),
];
```

Create **`src/test/server.js`**:

```js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Intercepts real HTTP requests made by Axios in Node. The app code doesn't know it's being tested.
export const server = setupServer(...handlers);
```

Create **`src/test/setup.js`**:

```js
import "@testing-library/jest-dom/vitest"; // adds toBeInTheDocument, toBeDisabled, toHaveValue...
import { server } from "./server";

// jsdom doesn't implement matchMedia, which useMediaQuery (and ThemeSync) rely on.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// "error": a request with no handler fails the test loudly instead of hitting a real server.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers(); // undo per-test server.use(...) overrides
  localStorage.clear();
});
afterAll(() => server.close());
```

Create **`src/test/render.jsx`**:

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { useAuthStore } from "@/features/auth/authStore";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUiStore } from "@/stores/uiStore";

/** A fresh client per test: no shared cache and no retries (failures show immediately). */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

/** Puts the global stores into a known state. Stores are module singletons, so reset them per test. */
export function setTestSession(user) {
  useAuthStore.setState({
    user,
    accessToken: user ? "test-access" : null,
    refreshToken: user ? "test-refresh" : null,
    isReady: true,
  });
  useUiStore.setState({ theme: "light", sidebarCollapsed: false, pageSize: DEFAULT_PAGE_SIZE, density: "comfortable" });
}

/**
 * Renders `ui` with the same providers as the real app, but with MemoryRouter
 * (the URL lives in memory) and a fresh QueryClient.
 */
export function renderWithProviders(ui, { route = "/", user = null } = {}) {
  setTestSession(user);
  const queryClient = createTestQueryClient();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{ui}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), queryClient, ...utils };
}
```

### 20.5 Unit tests: logic, schemas, hooks, components

**`src/features/auth/permissions.test.js`**

```js
import { adminUser, employeeUser, hrUser } from "@/test/fixtures";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("allows admins to delete employees but not HR", () => {
    expect(hasPermission(adminUser, "employees.delete")).toBe(true);
    expect(hasPermission(hrUser, "employees.delete")).toBe(false);
  });

  it("lets HR review leave but not employees", () => {
    expect(hasPermission(hrUser, "leaves.review")).toBe(true);
    expect(hasPermission(employeeUser, "leaves.review")).toBe(false);
  });

  it("denies everything when logged out or for unknown permissions", () => {
    expect(hasPermission(null, "leaves.request")).toBe(false);
    expect(hasPermission(adminUser, "made.up")).toBe(false);
  });
});
```

**`src/features/leaves/schemas.test.js`**

```js
import { leaveRequestSchema } from "./schemas";

const validRequest = {
  leave_type: "ANNUAL",
  start_date: "2026-12-01",
  end_date: "2026-12-03",
  reason: "Family holiday abroad",
};

describe("leaveRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(leaveRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects an end date before the start date, and reports it on end_date", () => {
    const result = leaveRequestSchema.safeParse({ ...validRequest, end_date: "2026-11-30" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["end_date"]);
  });

  it("requires a meaningful reason", () => {
    const result = leaveRequestSchema.safeParse({ ...validRequest, reason: "trip" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Please give at least 10 characters");
  });
});
```

**`src/hooks/useDebounce.test.js`**: hooks are tested with `renderHook` and **fake timers**:

```js
import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("updates only after the value has stopped changing for the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: "a" } });
    expect(result.current).toBe("a");

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" }); // restarts the timer
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a"); // still waiting

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});
```

**`src/components/ui/Button.test.jsx`**

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and calls onClick", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and marked busy while loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
```

### 20.6 Integration tests: auth UI and guards

**`src/features/auth/components/ProtectedRoute.test.jsx`**

```jsx
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { employeeUser, hrUser } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

function renderAt(route, user) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login screen</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/employees" element={<p>Employees screen</p>} />
        <Route element={<RoleRoute permission="leaves.review" />}>
          <Route path="/approvals" element={<p>Approvals screen</p>} />
        </Route>
      </Route>
    </Routes>,
    { route, user },
  );
}

describe("route guards", () => {
  it("redirects anonymous visitors to the login page", () => {
    renderAt("/employees", null);
    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("shows protected pages to signed-in users", () => {
    renderAt("/employees", employeeUser);
    expect(screen.getByText("Employees screen")).toBeInTheDocument();
  });

  it("shows the forbidden page when the role lacks the permission", () => {
    renderAt("/approvals", employeeUser);
    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument();
  });

  it("lets HR into the approvals page", () => {
    renderAt("/approvals", hrUser);
    expect(screen.getByText("Approvals screen")).toBeInTheDocument();
  });
});
```

**`src/features/auth/pages/LoginPage.test.jsx`**

```jsx
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { useAuthStore } from "@/features/auth/authStore";
import { TEST_PASSWORD } from "@/test/handlers";
import { renderWithProviders } from "@/test/render";
import LoginPage from "./LoginPage";

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>Dashboard home</p>} />
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginPage", () => {
  it("shows validation errors when submitted empty", async () => {
    const { user } = renderLogin();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("signs in, stores the user and redirects to the dashboard", async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/^email/i), "hr@peopledesk.test");
    await user.type(screen.getByLabelText(/^password/i), TEST_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
    expect(useAuthStore.getState().user.email).toBe("hr@peopledesk.test");
  });

  it("shows a friendly message for wrong credentials", async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/^email/i), "hr@peopledesk.test");
    await user.type(screen.getByLabelText(/^password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
```

### 20.7 Integration tests: the employee workflows

**`src/features/employees/pages/EmployeesPage.test.jsx`**

```jsx
import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { API_URL } from "@/lib/apiClient";
import { adminUser, employeeUser, hrUser } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";
import EmployeesPage from "./EmployeesPage";

function renderEmployees(user = hrUser) {
  return renderWithProviders(
    <Routes>
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/employees/:employeeId" element={<p>Profile page</p>} />
    </Routes>,
    { route: "/employees", user },
  );
}

describe("EmployeesPage", () => {
  it("lists employees from the API", async () => {
    renderEmployees();
    expect(await screen.findByText("Amara Okafor")).toBeInTheDocument();
    expect(screen.getByText("Liam Novak")).toBeInTheDocument();
  });

  it("searches on the server once the user stops typing", async () => {
    const { user } = renderEmployees();
    await screen.findByText("Amara Okafor");

    await user.type(screen.getByRole("searchbox", { name: "Search employees" }), "liam");

    await waitFor(() => expect(screen.queryByText("Amara Okafor")).not.toBeInTheDocument());
    expect(screen.getByText("Liam Novak")).toBeInTheDocument();
  });

  it("hides management actions from the Employee role", async () => {
    renderEmployees(employeeUser);
    await screen.findByText("Amara Okafor");
    expect(screen.queryByRole("link", { name: /add employee/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("deletes an employee after confirmation", async () => {
    let deletedId = null;
    server.use(
      http.delete(`${API_URL}/employees/:id/`, ({ params }) => {
        deletedId = params.id;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderEmployees(adminUser);

    await user.click(await screen.findByRole("button", { name: "Delete Amara Okafor" }));
    const dialog = screen.getByRole("dialog", { name: "Delete employee?" });
    await user.click(within(dialog).getByRole("button", { name: "Delete employee" }));

    await waitFor(() => expect(deletedId).toBe("1"));
    expect(await screen.findByText("Amara Okafor was deleted.")).toBeInTheDocument();
  });

  it("rolls back an optimistic status change when the server fails", async () => {
    server.use(http.patch(`${API_URL}/employees/:id/`, () => HttpResponse.json({ detail: "boom" }, { status: 500 })));
    const { user } = renderEmployees();

    const statusSelect = await screen.findByRole("combobox", { name: "Status for Amara Okafor" });
    await user.selectOptions(statusSelect, "INACTIVE");

    expect(await screen.findByText(/the server had a problem/i)).toBeInTheDocument();
    await waitFor(() => expect(statusSelect).toHaveValue("ACTIVE"));
  });
});
```

### 20.8 Run the tests

```bash
npm test
```

`npm test` starts Vitest in watch mode and reruns affected tests when files change. For a single CI-style run:

```bash
npm run test:run
```

### 20.9 How it works

- **MSW** intercepts requests at the network layer, so the real `apiClient`, interceptors, TanStack Query and components all run, exactly as in the browser. Only the server is fake. Per-test `server.use(...)` overrides simulate failures.
- **`findBy*`** queries wait (up to 1 s by default) for async UI. **`queryBy*`** returns `null` instead of throwing, which is how you assert that something is absent. **`waitFor`** retries an assertion until it passes.
- Queries are **accessibility-first**: `getByRole("button", { name: "Delete Amara Okafor" })` only works because the icon button has an `aria-label`. Good tests push you towards accessible UI.

> 💡 **Interview question: "Why mock the network instead of mocking Axios or your hooks?"** Mocking modules couples tests to implementation details. Swap Axios for `fetch` and every test breaks even though behaviour didn't change. Network-level mocks test the integration you actually ship.

### 20.10 Exercises

1. Test that `EmployeeForm` blocks "Continue" on step 1 with an invalid email and shows the message.
2. Test the server-error mapping: override `POST /employees/` to return `{"email": ["employee with this email already exists."]}` and assert the message appears under the email field after submit.
3. Test `MyLeavesPage`'s "No employee profile" state using a user with `employee_id: null`.
4. Add coverage reporting: `npm install -D @vitest/coverage-v8`, then run `npx vitest run --coverage`.

### 20.11 Common mistakes

> ⚠️ **Sharing a QueryClient between tests** leaks cached data from one test into the next. Create one per test.

> ⚠️ **`getBy*` for async content** fails before the data arrives. Use `findBy*`.

> ⚠️ **Forgetting to reset global stores.** Zustand stores are module singletons. `setTestSession` resets them for every render.

> ⚠️ **Testing implementation details** ("`setState` was called with…", class names). Assert on what the user sees.

### 20.12 Checkpoint

You can configure Vitest with jsdom and MSW, write unit tests for schemas and hooks, write integration tests for auth, routing and employee workflows (including failure paths), and explain why accessible queries and network-level mocks make tests more valuable.

---

<a id="phase-21"></a>

## Phase 21: Production Readiness and Deployment

### 21.1 Learning objectives

- Run a production build and verify it locally.
- Configure environment variables per environment.
- Deploy the SPA with correct client-side routing fallbacks.
- Harden the Django API for production.
- Add continuous integration.

### 21.2 Pre-flight checklist

```bash
npm run lint
```

```bash
npm run test:run
```

```bash
npm run build
```

```bash
npm run preview
```

`preview` serves `dist/` at `http://localhost:4173`. Click through every page. Note that the backend's `CORS_ALLOWED_ORIGINS` must include `http://localhost:4173` for preview to reach the API, so add it to `backend/.env` temporarily.

| Check | Why |
|---|---|
| No `console.log` debugging left | Noise and occasional data leaks |
| `VITE_API_URL` set for each environment | Built into the bundle **at build time**, so rebuild per environment |
| No secrets in frontend env vars | Everything in a frontend bundle is public |
| Lighthouse (Chrome DevTools) accessibility ≥ 95 | Labels, contrast, focus order |
| Keyboard-only pass | Tab through login, the employee wizard, modals and menus |
| Throttled network pass | Skeletons, retries and the offline banner behave |
| Error monitoring | Report from `ErrorBoundary.componentDidCatch` to a service such as Sentry |

### 21.3 Environment files

Vite loads `.env`, `.env.local`, `.env.[mode]` and `.env.[mode].local`. Create **`frontend/.env.production`**:

```ini
VITE_API_URL=https://api.peopledesk.example.com/api
```

`npm run build` uses `production` mode and therefore this file.

### 21.4 Deploying the frontend

The build is static files. The one rule for SPAs: **every unknown path must return `index.html`**, so React Router can handle `/employees/42` on refresh.

**Netlify**: create **`frontend/public/_redirects`**:

```text
/*    /index.html   200
```

**Vercel**: create **`frontend/vercel.json`**:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Nginx / Docker**: create **`frontend/nginx.conf`**:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # Hashed asset files never change, so cache them for a year.
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # SPA fallback: serve index.html for client-side routes.
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

and **`frontend/Dockerfile`**:

```dockerfile
# Stage 1: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: serve the static files
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build --build-arg VITE_API_URL=https://api.peopledesk.example.com/api -t peopledesk-frontend .
```

### 21.5 Hardening the Django API (concise)

Install the production extras:

```bash
pip install gunicorn whitenoise
```

1. Set `DJANGO_DEBUG=False`, a long random `DJANGO_SECRET_KEY`, real `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS=https://app.peopledesk.example.com` in the server environment.
2. Add `"whitenoise.middleware.WhiteNoiseMiddleware"` directly after `SecurityMiddleware`, and run `python manage.py collectstatic`.
3. Store uploads in object storage (S3 or similar, via `django-storages`). Container disks are temporary.
4. Add `SECURE_SSL_REDIRECT = True`, `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True` and `SECURE_HSTS_SECONDS = 31536000` behind HTTPS.
5. Use a managed PostgreSQL instance and run `python manage.py migrate` on deploy.
6. Run `python manage.py check --deploy` and fix every warning.
7. Serve with `gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3`.

### 21.6 Continuous integration

Create **`.github/workflows/frontend.yml`** at the repository root:

```yaml
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
```

### 21.7 Exercises

1. Deploy the frontend to Netlify or Vercel and the API to a platform such as Render, Railway or Fly.io. Update CORS and `VITE_API_URL`.
2. Add a `/api/health/` endpoint and a status indicator on the login page.
3. Add a Content Security Policy header in `nginx.conf` that allows only your API origin in `connect-src`.

### 21.8 Checkpoint

You can build and preview production bundles, explain build-time env vars, configure the SPA fallback on any host, list the key Django production settings, and run lint, tests and build in CI.

---

<a id="appendix-a"></a>

## Appendix A: API Reference

The full contract, with every endpoint, permission and payload, is in [Phase 2, §2.11](#api-contract). This table shows which frontend module calls which endpoint:

| Frontend module | Endpoints |
|---|---|
| `features/auth/api.js` | `POST /auth/login/`, `GET/PATCH /auth/me/`, `POST /auth/change-password/`, `POST /auth/logout/` |
| `lib/apiClient.js` (`refreshAccessToken`) | `POST /auth/refresh/` |
| `features/employees/api.js` | `GET/POST /employees/`, `GET/PATCH/DELETE /employees/{id}/` |
| `features/departments/api.js` | `GET/POST /departments/`, `GET/PATCH/DELETE /departments/{id}/` |
| `features/leaves/api.js` | `GET/POST /leaves/`, `POST /leaves/{id}/approve|reject|cancel/` |
| `features/activity/api.js` | `GET /activities/` |
| `features/dashboard/api.js` | `GET /dashboard/stats/` |
| `features/users/api.js` | `GET/POST /users/`, `PATCH/DELETE /users/{id}/` |

---

<a id="appendix-b"></a>

## Appendix B: Final Folder Structure

```text
frontend/
├── .env / .env.example / .env.production
├── index.html
├── jsconfig.json
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/ (_redirects for Netlify)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── app/
    │   ├── AppProviders.jsx
    │   ├── AppRoutes.jsx
    │   ├── navigation.js
    │   ├── queryClient.js
    │   └── ThemeSync.jsx
    ├── components/
    │   ├── feedback/   ErrorBoundary.jsx · Loaders.jsx · ToastProvider.jsx · toastContext.js · useToast.js
    │   ├── form/       Field.jsx · TextField.jsx · SelectField.jsx · TextAreaField.jsx · CheckboxField.jsx · FormError.jsx · fieldStyles.js
    │   ├── layout/     AppLayout.jsx · AuthLayout.jsx · Sidebar.jsx · Topbar.jsx · PageHeader.jsx · Logo.jsx
    │   │               ThemeToggle.jsx · UserMenu.jsx · OfflineBanner.jsx
    │   └── ui/         Avatar · Badge · Button · buttonStyles.js · Card · ConfirmDialog · Dropdown · EmptyState
    │                   ErrorState · Modal · Pagination · SearchInput · Skeleton · Spinner · Steps · Tabs
    │                   Button.test.jsx
    ├── features/
    │   ├── activity/     api.js · queries.js · components/ActivityFeed.jsx
    │   ├── auth/         api.js · authStore.js · permissions.js (+ .test.js) · schemas.js · session.js · usePermission.js
    │   │                 components/ AuthBootstrap · Can · ProtectedRoute (+ .test.jsx) · RoleRoute
    │   │                 pages/LoginPage.jsx (+ .test.jsx)
    │   ├── dashboard/    api.js · queries.js · chartTheme.js
    │   │                 components/ ChartCard · DepartmentChart · HiresChart · StatCard · StatusChart
    │   │                 pages/DashboardPage.jsx
    │   ├── departments/  api.js · queries.js · mutations.js · schemas.js
    │   │                 components/ AssignEmployeeModal · DepartmentCard · DepartmentFormModal
    │   │                 pages/ DepartmentsPage · DepartmentDetailPage
    │   ├── employees/    api.js · queries.js · mutations.js · schemas.js · hooks/useEmployeeFilters.js
    │   │                 components/ AvatarUpload · DeleteEmployeeDialog · EmergencyContactsField · EmployeeActivity
    │   │                             EmployeeFilters · EmployeeForm · EmployeeLeaveHistory · EmployeeOverview
    │   │                             EmployeeRow · EmployeeStatusBadge · EmployeeTable · SortableHeader
    │   │                 pages/ EmployeesPage (+ .test.jsx) · EmployeeDetailPage · EmployeeCreatePage · EmployeeEditPage
    │   ├── leaves/       api.js · queries.js · mutations.js · schemas.js (+ .test.js)
    │   │                 components/ LeaveRequestModal · LeaveStatusBadge · LeaveSummary · LeaveTable · ReviewLeaveModal
    │   │                 pages/ MyLeavesPage · LeaveApprovalsPage
    │   ├── settings/     mutations.js · schemas.js
    │   │                 components/ ChangePasswordForm · PreferencesForm · ProfileForm
    │   │                 pages/SettingsPage.jsx
    │   └── users/        api.js · queries.js · mutations.js · schemas.js
    │                     components/ PermissionMatrix · RoleBadge · UserFormModal · UserTable
    │                     pages/UsersPage.jsx
    ├── hooks/   useClickOutside · useDebounce (+ .test.js) · useDebouncedCallback · useDisclosure · useDocumentTitle
    │            useFieldIds · useLatest · useMediaQuery · useOnlineStatus · useScrolled
    ├── lib/     apiClient.js · apiErrors.js · cn.js · constants.js · format.js · queryKeys.js · throttle.js
    ├── pages/   ForbiddenPage.jsx · NotFoundPage.jsx
    ├── stores/  uiStore.js
    └── test/    fixtures.js · handlers.js · render.jsx · server.js · setup.js
```

---

<a id="appendix-c"></a>

## Appendix C: React Concepts Checklist

Tick each item when you can **explain it and point to where PeopleDesk uses it**.

**Fundamentals**
- [ ] Virtual DOM, reconciliation, render vs commit (Phase 3)
- [ ] JSX rules and what it compiles to (3)
- [ ] Components, props, destructuring, defaults, rest/spread (5: `Button`)
- [ ] `children` and composition (5: `Card`; 7: layouts)
- [ ] One-way data flow and lifting state up (5: lab; 7: `AppLayout`)
- [ ] Event handling and synthetic events (5)
- [ ] Conditional rendering patterns, and the `0 &&` trap (5)
- [ ] Lists, keys and the index-key bug (5: experiment; 12: `useFieldArray`)
- [ ] Fragments, including keyed Fragments (5)
- [ ] Controlled vs uncontrolled inputs (5, 10, 12)
- [ ] Derived state vs duplicated state (5: `Avatar`; 11: `EmployeeFilters`)

**Hooks**
- [ ] `useState`: snapshots, functional updates, lazy init, batching (6)
- [ ] `useEffect`: dependencies, cleanup, Strict Mode, stale closures (6, 10)
- [ ] `useContext` (8: toasts; 6: dropdown)
- [ ] `useRef`: DOM refs and mutable values (6: stopwatch; 12: `AvatarUpload`)
- [ ] `useMemo` / `useCallback`: when and when not (6, 11, 18)
- [ ] `useReducer` (8: toast reducer)
- [ ] Custom hooks (6: `useDebounce`, `useDisclosure`…; 11: `useEmployeeFilters`)
- [ ] `useId` (6, 10: form fields)
- [ ] `useTransition` (12: profile tabs)
- [ ] `useDeferredValue` (16: users search)
- [ ] `useSyncExternalStore` and `useLayoutEffect` (6, 19)

**Architecture**
- [ ] Feature-based folders; container vs presentational (7)
- [ ] Composition over prop drilling (8)
- [ ] Local vs global client vs server vs URL state (8, 11)
- [ ] Compound components, render props, portals (6, 12)

**Routing**
- [ ] `BrowserRouter`, `Routes`, `Route`, nested and layout routes, `Outlet`, index routes (7)
- [ ] `useParams`, `useNavigate`, `useLocation`, `useSearchParams`, `NavLink` (7, 11, 17)
- [ ] Protected and role-based routes, redirects with `state` (10)
- [ ] 404 and 403 pages (7, 10)
- [ ] Route-level lazy loading (18)

**Forms**
- [ ] React Hook Form `register`, `handleSubmit`, `formState` (10)
- [ ] Zod schemas, `.refine`, `path`, context-dependent schemas (10, 14, 16)
- [ ] Multi-step forms with `trigger` (12)
- [ ] `useFieldArray`, `Controller`, `useWatch` (12, 14)
- [ ] File uploads with `FormData` and previews (12)
- [ ] Server-side validation errors mapped onto fields (9, 12)

**Data**
- [ ] Axios instance and request/response interceptors (9)
- [ ] JWT access/refresh, silent and de-duplicated refresh (9, 10)
- [ ] `useQuery`, keys, `staleTime`, `gcTime`, `enabled`, `placeholderData` (11)
- [ ] `useMutation`, invalidation, `setQueryData` (12)
- [ ] Optimistic updates with rollback (12)
- [ ] Prefetching, polling, structural sharing (11, 15)
- [ ] Cancellation and race conditions (11, 19)

**Performance and quality**
- [ ] Causes of re-renders; Profiler (18)
- [ ] `memo` + stable props (18)
- [ ] Code splitting, `lazy`, `Suspense` boundaries (18)
- [ ] Debounce vs throttle vs defer vs virtualise (18)
- [ ] Error boundaries and their limits (7, 19)
- [ ] Testing with Vitest, RTL, user-event, MSW (20)

**JavaScript**
- [ ] Destructuring, spread/rest, template literals, optional chaining, nullish coalescing (5)
- [ ] `map`, `filter`, `reduce`, `find`, `some`, `every`, `flatMap` (5, 12, 14)
- [ ] Immutability (5, 12)
- [ ] Closures (6)
- [ ] Promises, `async`/`await`, error handling (9)
- [ ] Event loop basics (6)
- [ ] ES modules: named vs default exports (3)

---

<a id="appendix-d"></a>

## Appendix D: Project Completion Checklist

- [ ] Backend runs on PostgreSQL with demo data; all endpoints in §2.11 respond
- [ ] Login, logout, session restore on reload, silent token refresh
- [ ] Sidebar items and routes respect Admin / HR / Employee permissions; 403 and 404 pages work
- [ ] Dashboard: six KPI cards (linked to filtered lists), three charts, activity feed for Admin/HR
- [ ] Employees: server-side search (debounced), filters, sorting, pagination in the URL; prefetching
- [ ] Employee wizard: per-step validation, photo upload with preview, emergency contacts, server errors on fields
- [ ] Employee profile: tabs (overview, leave history, activity), edit, delete with confirmation
- [ ] Optimistic status change with rollback
- [ ] Departments: CRUD in modals, detail page, assign and remove members
- [ ] Leave: request with validation and day count, cancel, approvals queue, approve/reject with notes, history
- [ ] Users: admin-only CRUD, role changes, activation, permission matrix, deferred search
- [ ] Settings: profile update reflected in the top bar, password change, theme/density/page size preferences
- [ ] Dark mode with no flash on load
- [ ] Responsive at 375 px, 768 px and 1280 px
- [ ] Skeletons, empty states, error states with retry, toasts, offline banner
- [ ] Route-level code splitting verified in `npm run build` output
- [ ] All tests pass (`npm run test:run`); lint is clean
- [ ] Deployed (or deployable) with SPA fallback and production Django settings
- [ ] README with screenshots, the stack, the architecture diagram, and the demo accounts

---

<a id="appendix-e"></a>

## Appendix E: Intermediate React Interview Questions and Answers

**1. What happens when you call a state setter?**
React schedules a re-render of that component (and, by default, its children). During the next render, `useState` returns the new value. The current render's variable doesn't change: it's a snapshot. Multiple updates in the same event are batched into one render. If the new value is identical (`Object.is`), React may skip the render.

**2. Why are keys needed in lists, and why is the index a bad key?**
Keys let reconciliation match old and new children by identity. With index keys, inserting, removing or sorting shifts identities, so state (input values, focus, component state) attaches to the wrong item, and React does more DOM work. Use a stable id from the data. Index keys are only acceptable for static lists that never reorder.

**3. Explain `useEffect` dependencies and cleanup.**
The effect runs after commit. It re-runs when any dependency changes, compared with `Object.is`. The cleanup runs before the next effect and on unmount. Missing dependencies cause stale closures; unstable dependencies (objects or functions recreated every render) cause effects to run every render. Fix with functional updates, by moving values inside the effect, with `useMemo`/`useCallback`, or with a latest-ref pattern.

**4. Why does my effect run twice in development?**
Strict Mode simulates mount → unmount → mount to check that effects clean up properly. Production runs it once. The fix is a correct cleanup (abort the fetch, unsubscribe), not disabling Strict Mode. For one-time side effects (like PeopleDesk's token refresh), make the operation idempotent or share the in-flight promise.

**5. What is a stale closure? Give an example.**
A function that captured variables from an earlier render. Example: `setInterval(() => setCount(count + 1), 1000)` inside an effect with `[]` deps always sees `count = 0`. Fix: `setCount((c) => c + 1)`, or include `count` in the dependencies.

**6. When should you use `useMemo` and `useCallback`?**
When referential stability matters (props to `memo` children, effect dependencies, query keys, context values), or for measurably expensive calculations. Not by default: they add overhead and noise. The React Compiler can automate much of this.

**7. How does `React.memo` work and when does it fail?**
It shallow-compares props and skips the render if they're equal. It fails when a parent passes a new object, array or function each render (including inline `children` JSX), or when the component reads a context that changes. Stabilise props with `useMemo`/`useCallback`, or restructure.

**8. Context vs Zustand/Redux: when do you use which?**
Context is dependency injection: good for rarely changing values (theme, current user, a stable service like toasts). Every consumer re-renders when the value changes, and there are no selectors. Stores have selector-based subscriptions, work outside React (interceptors), and offer middleware such as persistence. Use them for frequently changing or widely read global client state. Neither is for server state.

**9. What's server state, and why use TanStack Query for it?**
Data owned by the server: asynchronous, shared, possibly stale. TanStack Query gives you caching, deduplication, background refetching, retries, cancellation, pagination helpers, invalidation and optimistic updates. Hand-written `useEffect` + `useState` reimplements all of that badly.

**10. Explain `staleTime` vs `gcTime`.**
`staleTime`: how long data counts as fresh (no refetch when you mount or focus). `gcTime`: how long *unused* cached data is kept before removal. Data can be stale but still cached, so it's shown instantly while it refetches.

**11. How do you implement an optimistic update?**
In `onMutate`: cancel related queries, snapshot the cache, write the expected result, return the snapshot. In `onError`: restore the snapshot. In `onSettled`: invalidate. Use it for fast, likely-to-succeed actions.

**12. How do you handle authentication in a SPA?**
Get tokens on login. Attach the access token with a request interceptor. On 401, refresh once (de-duplicated) and retry. On refresh failure, clear the session. Restore the session on startup before rendering routes. Guard routes with layout routes. Hide UI by permission, but always enforce permissions on the server. Know the storage trade-offs: localStorage vs httpOnly cookies.

**13. Controlled vs uncontrolled components?**
Controlled: React state holds the value (`value` + `onChange`), which means full control and a re-render per keystroke. Uncontrolled: the DOM holds it, and you read it with refs or `FormData`. React Hook Form uses uncontrolled inputs for performance and `Controller` to integrate controlled widgets.

**14. How do you share logic between components?**
Custom hooks for stateful logic, components for UI, plain modules for pure functions. Historically, HOCs and render props; render props are still useful for customising rendering, as in `LeaveTable`'s `renderActions`.

**15. What's prop drilling and how do you avoid it?**
Passing props through layers that don't use them. Avoid it with composition (pass elements as `children` or props), Context, or a store. Pick the lightest option that works.

**16. What do error boundaries catch?**
Errors thrown while rendering, in lifecycle methods, and in constructors of their child tree. Not in event handlers, async code, server rendering or the boundary itself. They're still class components (`getDerivedStateFromError`, `componentDidCatch`).

**17. What are portals for?**
Rendering into a different DOM node (modals, toasts, tooltips) to escape `overflow`, `z-index` and stacking contexts, while staying in the same React tree for context and event bubbling.

**18. How does code splitting work in React?**
Dynamic `import()` creates a separate chunk. `React.lazy` wraps it in a component that suspends until it loads, and `Suspense` shows a fallback. Split at the route level first. Place boundaries so stable UI (layout) stays visible.

**19. `useTransition` vs `useDeferredValue`?**
Both mark work as non-urgent so urgent updates (typing, clicking) stay responsive. `useTransition` wraps a state update you trigger and gives you `isPending`. `useDeferredValue` gives you a lagging copy of a value you receive. Neither speeds up network requests.

**20. Debounce vs throttle?**
Debounce: run after events stop for N ms (search input, autosave). Throttle: run at most once every N ms during continuous events (scroll, resize).

**21. How do you find and fix a performance problem?**
Reproduce it, record with the React Profiler (and the browser Performance panel), find components with long or frequent renders and read *why* they rendered, fix the structure (colocate state, split components, pass `children`), then memoise the hot path, virtualise huge lists, and split bundles. Measure again.

**22. How would you structure a large React app?**
By feature: each feature owns its pages, components, API calls, query hooks and schemas. Shared UI primitives and generic hooks live in common folders. Keep dependency direction one-way (features → shared). Centralise query keys and API clients.

**23. How do you test a component that fetches data?**
Render it with real providers (a fresh QueryClient, a router), mock the network with MSW, interact with user-event, and assert with `findBy*` on visible output. Cover success, empty and error paths. Don't mock your own hooks.

**24. What does Strict Mode do?**
In development it double-invokes render functions, reducers and state initialisers, double-runs effects (mount → unmount → mount), and warns about deprecated APIs, so impure code and missing cleanups surface early.

**25. What's the difference between `useEffect` and an event handler for side effects?**
Event handlers run in response to a specific user action. Put "when the user clicks Save, POST" logic there. Effects synchronise with external systems because the component is rendered with certain values. Using effects for event logic causes extra renders and bugs.

**26. Why should state updates be immutable?**
React (and `memo`, selectors, TanStack Query) detect changes by reference. Mutating in place keeps the same reference, so updates can be skipped. Immutable updates also make history and rollbacks (as in optimistic updates) trivial.

**27. What is reconciliation's "same type, same position" rule and why does it matter?**
If an element at the same position has the same type, React updates it in place and keeps its state. A different type remounts it. Defining components inside other components creates a new type every render, so it remounts and loses state.

**28. How do you keep URL state and component state in sync?**
Treat the URL as the source of truth for shareable state (filters, pagination, tabs). Read with `useSearchParams`, write with a setter, and memoise the parsed object. For local "draft" state (the search text being typed), sync from the URL during render with a guarded comparison, and commit to the URL with a debounced callback.

**29. How do React Server Components and Next.js differ from this app?**
PeopleDesk is a client-rendered SPA: the browser downloads JavaScript and fetches data from an API. Next.js (App Router) renders on the server. Server Components run only on the server and can read data directly with no client bundle; client components hydrate for interactivity. Benefits: faster first paint, SEO, less client JS. Costs: server infrastructure and a different mental model. An authenticated internal tool like PeopleDesk is a great fit for an SPA.

**30. What are the Rules of Hooks and why do they exist?**
Call hooks only at the top level, and only from components or custom hooks. React stores hook state in call order per component. Conditional calls would misalign that order between renders.

---

<a id="appendix-f"></a>

## Appendix F: Practical Coding Challenges

1. **Bulk actions.** Add row checkboxes to the employee table, a "select all on this page" header checkbox (with the indeterminate state via a ref), and bulk status change and bulk delete with `Promise.allSettled` and a summary toast.
2. **Saved views.** Let users save the current employee filters as a named view (stored in Zustand + persist) and apply them from a dropdown. The URL stays the source of truth.
3. **CSV export.** Export the current filtered employee list to CSV client-side by fetching all pages with `queryClient.fetchQuery` and building a `Blob`.
4. **Undo delete.** Replace the delete confirmation with a toast that has an "Undo" button: delay the actual DELETE for 5 seconds and hide the row optimistically.
5. **Infinite scroll.** Build an alternative "Directory" page with `useInfiniteQuery` and an `IntersectionObserver` sentinel.
6. **Keyboard shortcuts.** `/` focuses the search box and `n` opens "Add employee" (for Admin/HR). Write a `useHotkey` custom hook with correct cleanup, and ignore keystrokes inside inputs.
7. **Command palette.** `Ctrl/Cmd+K` opens a modal that searches employees and pages, with arrow-key navigation. Use `useDeferredValue` for filtering and a portal.
8. **Org chart.** Add `manager` to `Employee` and render a collapsible tree recursively, with memoised nodes.
9. **Form autosave.** Autosave the edit form as a draft to localStorage (debounced) and offer "Restore draft" when reopening.
10. **Leave calendar.** A month grid showing approved leave per day across the company, with a `useMemo`-built day → employees map and a team filter.
11. **Optimistic leave review.** Make approve/reject optimistic: remove the request from the pending list immediately, and roll back on error.
12. **Accessibility audit.** Run axe DevTools on every page, fix the issues, and add `jest-axe`-style checks to a couple of tests.

---

<a id="appendix-g"></a>

## Appendix G: Suggested Independent Modifications

- **TypeScript migration.** Rename files to `.tsx`, add types for every API shape, infer form types with `z.infer`, and type the query key factory.
- **Link users and employees** from the admin UI (backend field plus a select in `UserFormModal`).
- **Leave balances and policies** per leave type, with entitlement per year and a balance shown before requesting.
- **Document uploads** per employee (contracts, IDs) with a list, download and delete, reusing the `FormData` patterns.
- **Notifications**: a bell in the top bar polling `/notifications/`, mark as read, optimistic count.
- **Audit log page** with filters (actor, target type, date range) over `/activities/`.
- **Internationalisation** with `react-i18next`, including date and number formats per locale.
- **Server-side sorting on every column** plus column visibility toggles persisted in the UI store.
- **Department managers** who can approve leave only for their own department (backend permission + UI).
- **httpOnly cookie auth**: move the refresh token to a cookie, add CSRF handling, and compare the code.
- **Playwright E2E tests** for login → create employee → approve leave against the real backend.
- **Storybook** for the UI kit, with stories for every component state.

---

<a id="appendix-h"></a>

## Appendix H: Before You Apply for Intermediate React Roles

You should be able to do these **without this guide open**:

- Scaffold a Vite + React + Tailwind + React Router + TanStack Query app and explain every file.
- Build a CRUD feature end to end: API module, query and mutation hooks, list with server-side pagination/filter/sort, form with validation and server errors, delete with confirmation, and correct invalidation.
- Implement JWT auth with interceptors, refresh, protected routes and role-based UI, and discuss the token storage trade-offs.
- Decide where any piece of state belongs (local, URL, global client, server) and defend the decision.
- Explain and debug re-renders with the Profiler, and apply `memo`/`useMemo`/`useCallback` only where they help.
- Write effects with correct dependencies and cleanups, and explain Strict Mode's double invocation.
- Write integration tests with RTL + MSW for a page, including failure paths.
- Build accessible components: labels, `aria-*`, focus management in modals, keyboard support.
- Read an unfamiliar React codebase and find where data comes from, where it's cached and what invalidates it.
- Talk through **PeopleDesk's architecture** in 5 minutes: the layers, the state categories, the auth flow, the caching strategy and the testing approach.

**Portfolio tips**

- Put PeopleDesk on GitHub with a clear README, screenshots/GIFs, the architecture diagram, how to run it, and the demo accounts.
- Deploy it (with seeded demo data) and link it at the top of your CV.
- Write down three decisions you made and why (for example: "filters in the URL", "Zustand for the session, TanStack for server data", "network-level mocks in tests"). Interviewers love trade-off discussions.
- Add one feature from Appendix F or G that's **yours**, and be ready to explain it in depth.

---

<a id="appendix-i"></a>

## Appendix I: Beyond Intermediate: Next Steps

1. **TypeScript.** Expected in most React roles today. Migrate PeopleDesk.
2. **React Router's data and framework modes**: loaders, actions, `errorElement`, pending UI and type-safe routes. Compare them with the declarative approach you used.
3. **Next.js App Router and React Server Components**: server rendering, streaming, Server Actions, caching. Build a public "careers page" for PeopleDesk with it.
4. **Advanced TanStack Query**: `useInfiniteQuery`, Suspense queries (`useSuspenseQuery`), persistence, SSR hydration, offline mutations.
5. **The React Compiler** and the newer hooks: `use`, `useOptimistic`, `useActionState`, `useEffectEvent`, and form Actions.
6. **Testing at scale**: Playwright end-to-end tests, visual regression, contract tests against the API.
7. **Design systems and accessibility**: headless libraries (Radix, React Aria), WAI-ARIA patterns, Storybook.
8. **Performance engineering**: Web Vitals (LCP, INP, CLS), bundle budgets, virtualisation, image optimisation.
9. **State machines** (XState) for complex flows such as multi-step onboarding.
10. **Architecture**: monorepos (pnpm workspaces, Turborepo), micro-frontends, shared packages, and API layers generated from OpenAPI (DRF has `drf-spectacular`).
11. **Real-time**: WebSockets or Server-Sent Events for live notifications, integrated with the query cache.
12. **Observability**: error tracking, session replay and analytics, and how to act on them.

---

<a id="appendix-j"></a>

## Appendix J: References and Official Documentation

| Topic | Link |
|---|---|
| React (start with *Learn*, then *Reference*) | <https://react.dev/> |
| You Might Not Need an Effect | <https://react.dev/learn/you-might-not-need-an-effect> |
| Rules of Hooks / Rules of React | <https://react.dev/reference/rules> |
| React Compiler | <https://react.dev/learn/react-compiler> |
| Vite | <https://vite.dev/> |
| Tailwind CSS | <https://tailwindcss.com/docs> |
| React Router | <https://reactrouter.com/> |
| TanStack Query | <https://tanstack.com/query/latest> |
| Axios | <https://axios-http.com/docs/intro> |
| React Hook Form | <https://react-hook-form.com/> |
| Zod | <https://zod.dev/> |
| Zustand | <https://zustand.docs.pmnd.rs/> |
| Redux Toolkit (for comparison) | <https://redux-toolkit.js.org/> |
| Lucide React | <https://lucide.dev/guide/packages/lucide-react> |
| Recharts | <https://recharts.org/> |
| Vitest | <https://vitest.dev/> |
| React Testing Library | <https://testing-library.com/docs/react-testing-library/intro/> |
| user-event | <https://testing-library.com/docs/user-event/intro> |
| MSW | <https://mswjs.io/> |
| Django | <https://docs.djangoproject.com/> |
| Django REST Framework | <https://www.django-rest-framework.org/> |
| SimpleJWT | <https://django-rest-framework-simplejwt.readthedocs.io/> |
| django-filter | <https://django-filter.readthedocs.io/> |
| django-cors-headers | <https://github.com/adamchainz/django-cors-headers> |
| WAI-ARIA Authoring Practices | <https://www.w3.org/WAI/ARIA/apg/> |

---

**You made it.** You've built a real, role-aware, tested, production-ready React application and learned the reasoning behind every pattern in it. Now make it yours: pick features from Appendix F and G, ship them, and talk about the trade-offs you made. That's what intermediate React developers do every day.
