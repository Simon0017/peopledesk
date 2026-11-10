import { useParams } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  return <PageHeader title={`Department #${departmentId}`} description="Built in Phase 13." backTo="/departments" backLabel="Departments" />;
}
