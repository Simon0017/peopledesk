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
