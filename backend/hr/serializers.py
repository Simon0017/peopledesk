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
