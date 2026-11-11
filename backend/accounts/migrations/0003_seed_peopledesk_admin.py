import os
from pathlib import Path

from django.contrib.auth.hashers import make_password
from django.db import migrations
from django.utils import timezone
from dotenv import load_dotenv


def create_peopledesk_admin(apps, schema_editor):
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    email = os.getenv("ADMIN_EMAIL")
    username = os.getenv("ADMIN_USERNAME")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not username or not password or password == "replace-with-a-strong-password":
        raise RuntimeError(
            "Set ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD in backend/.env "
            "before migrating. Replace the example password placeholder."
        )

    User = apps.get_model("accounts", "User")
    Department = apps.get_model("hr", "Department")
    Employee = apps.get_model("hr", "Employee")

    department, _ = Department.objects.using(schema_editor.connection.alias).get_or_create(
        code="OPS",
        defaults={
            "name": "Operations",
            "description": "Keeps the business running smoothly.",
        },
    )
    user, _ = User.objects.using(schema_editor.connection.alias).get_or_create(
        email=email,
        defaults={
            "username": username,
            "first_name": "Ada",
            "last_name": "Admin",
            "role": "ADMIN",
            "password": make_password(password),
            "is_staff": False,
            "is_superuser": False,
        },
    )
    employee, _ = Employee.objects.using(schema_editor.connection.alias).get_or_create(
        email=email,
        defaults={
            "user_id": user.pk,
            "first_name": "Ada",
            "last_name": "Admin",
            "job_title": "Operations Director",
            "department_id": department.pk,
            "phone": "+1 555 0100",
            "hire_date": timezone.now().date(),
        },
    )
    if not employee.employee_id:
        employee.employee_id = f"EMP-{employee.pk:05d}"
        employee.save(using=schema_editor.connection.alias, update_fields=["employee_id"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_create_system_admin"),
        ("hr", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_peopledesk_admin, migrations.RunPython.noop),
    ]
