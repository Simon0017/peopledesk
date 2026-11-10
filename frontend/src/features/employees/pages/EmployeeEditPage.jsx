import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeEditPage() {
  const { employeeId } = useParams();
  return <PageHeader title={`Edit employee #${employeeId}`} description="Built in Phase 12." backTo={`/employees/${employeeId}`} />;
}
