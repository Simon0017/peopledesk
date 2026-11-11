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
