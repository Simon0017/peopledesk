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
