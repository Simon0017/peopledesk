import { useState, useTransition } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Mail, Pencil, Trash2, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useCan } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { EmployeeActivity } from "../components/EmployeeActivity";
import { EmployeeLeaveHistory } from "../components/EmployeeLeaveHistory";
import { EmployeeOverview } from "../components/EmployeeOverview";
import { EmployeeStatusBadge } from "../components/EmployeeStatusBadge";
import { useEmployee } from "../queries";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTabPending, startTransition] = useTransition();
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    // Conditional spread: only Admin/HR see the history tabs.
    ...(can("employees.viewHistory")
      ? [
          { id: "leave", label: "Leave history" },
          { id: "activity", label: "Activity" },
        ]
      : []),
  ];

  function handleTabChange(tabId) {
    // Non-urgent: the tab bar responds immediately; the new panel renders when ready.
    startTransition(() => setActiveTab(tabId));
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError) {
    const isNotFound = error?.response?.status === 404;
    return (
      <Card>
        {isNotFound ? (
          <EmptyState icon={UserX} title="Employee not found" description="They may have been deleted." />
        ) : (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        )}
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={employee.full_name}
        backTo="/employees"
        backLabel="Employees"
        actions={
          <>
            <a href={`mailto:${employee.email}`} className={buttonClasses({ variant: "secondary" })}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </a>
            {can("employees.manage") && (
              <Link to={`/employees/${employee.id}/edit`} className={buttonClasses({ variant: "secondary" })}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            )}
            {can("employees.delete") && (
              <Button variant="danger" leftIcon={Trash2} onClick={() => setEmployeeToDelete(employee)}>
                Delete
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar src={employee.avatar} name={employee.full_name} size="xl" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{employee.job_title}</h2>
            <EmployeeStatusBadge status={employee.status} />
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            {employee.department_name ?? "No department"} · {employee.employee_id}
          </p>
        </div>
      </Card>

      <Card>
        <div className="px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} isPending={isTabPending} />
        </div>
        <div role="tabpanel" className={isTabPending ? "opacity-70" : undefined}>
          {activeTab === "overview" && <EmployeeOverview employee={employee} />}
          {activeTab === "leave" && <EmployeeLeaveHistory employeeId={employee.id} />}
          {activeTab === "activity" && <EmployeeActivity employeeId={employee.id} />}
        </div>
      </Card>

      <DeleteEmployeeDialog
        employee={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onDeleted={() => navigate("/employees", { replace: true })}
      />
    </>
  );
}
