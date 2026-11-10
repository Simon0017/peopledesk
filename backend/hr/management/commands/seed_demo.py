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
FIRST_NAMES = [
    "Gaius", "Lucius", "Marcus", "Publius", "Quintus",
    "Titus", "Tiberius", "Gnaeus", "Aulus", "Appius",
    "Decimus", "Servius", "Sextus", "Manius", "Spurius",
    "Julius", "Claudius", "Flavius", "Aurelius", "Cornelius",
    "Valerius", "Octavius", "Maximus", "Hadrianus", "Traianus",
    "Nero", "Drusus", "Agrippa", "Vespasianus", "Domitianus"
]

LAST_NAMES = [
    "Julius", "Claudius", "Cornelius", "Aemilius", "Fabius",
    "Valerius", "Flavius", "Aurelius", "Octavius", "Antonius",
    "Licinius", "Cassius", "Brutus", "Cicero", "Scipio",
    "Gracchus", "Sulla", "Pompeius", "Crassus", "Severus",
    "Germanicus", "Drusus", "Agricola", "Hadrianus", "Traianus",
    "Vespasianus", "Domitianus", "Tullius", "Marcellus", "Lepidus"
]


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
