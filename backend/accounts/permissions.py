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
