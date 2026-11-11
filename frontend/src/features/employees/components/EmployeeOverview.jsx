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
