import os
from pathlib import Path

from django.contrib.auth.hashers import make_password
from django.db import migrations
from dotenv import load_dotenv


def create_system_admin(apps, schema_editor):
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
    User.objects.using(schema_editor.connection.alias).update_or_create(
        email=email,
        defaults={
            "username": username,
            "first_name": "Ada",
            "last_name": "Admin",
            "role": "ADMIN",
            "password": make_password(password),
            "is_staff": True,
            "is_superuser": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_system_admin, migrations.RunPython.noop),
    ]
