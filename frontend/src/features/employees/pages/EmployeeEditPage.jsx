import { useNavigate, useParams } from "react-router";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getErrorMessage } from "@/lib/apiErrors";
import { EmployeeForm } from "../components/EmployeeForm";
import { useUpdateEmployee } from "../mutations";
import { useEmployee } from "../queries";
import { toEmployeeFormData, toEmployeeFormValues } from "../schemas";

export default function EmployeeEditPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee();

  async function handleSubmit(values) {
    const updated = await updateEmployee.mutateAsync({ id: employee.id, data: toEmployeeFormData(values) });
    toast.success(`${updated.full_name} was updated.`);
    navigate(`/employees/${updated.id}`);
  }

  if (isPending) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader title={`Edit ${employee.full_name}`} backTo={`/employees/${employee.id}`} backLabel="Back to profile" />
      <div className="max-w-3xl">
        {/* key: if you navigate from one employee's edit page to another's, the form
            remounts and picks up the new defaultValues instead of keeping the old ones. */}
        <EmployeeForm
          key={employee.id}
          defaultValues={toEmployeeFormValues(employee)}
          currentAvatarUrl={employee.avatar}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${employee.id}`)}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}
