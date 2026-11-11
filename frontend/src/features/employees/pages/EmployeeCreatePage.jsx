import { useNavigate } from "react-router";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "../components/EmployeeForm";
import { useCreateEmployee } from "../mutations";
import { getEmptyEmployeeValues, toEmployeeFormData } from "../schemas";

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createEmployee = useCreateEmployee();

  // mutateAsync returns a promise, so EmployeeForm can await it and catch server errors.
  async function handleSubmit(values) {
    const employee = await createEmployee.mutateAsync(toEmployeeFormData(values));
    toast.success(`${employee.full_name} was added.`);
    navigate(`/employees/${employee.id}`);
  }

  return (
    <>
      <PageHeader title="Add employee" description="Create a new employee record." backTo="/employees" backLabel="Employees" />
      <div className="max-w-3xl">
        <EmployeeForm
          defaultValues={getEmptyEmployeeValues()}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/employees")}
          submitLabel="Create employee"
        />
      </div>
    </>
  );
}
