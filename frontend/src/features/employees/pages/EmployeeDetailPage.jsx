import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeDetailPage() {
  // The name matches the route segment ":employeeId". Params are always strings.
  const { employeeId } = useParams();
  return <PageHeader title={`Employee #${employeeId}`} description="Built in Phase 12." backTo="/employees" backLabel="Employees" />;
}
