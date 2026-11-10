import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeesPage() {
  return (
    <PageHeader
      title="Employees"
      description="Built in Phase 11."
      actions={<Link to="/employees/42" className="text-sm text-indigo-600 underline">Open employee 42</Link>}
    />
  );
}
