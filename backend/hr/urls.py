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
