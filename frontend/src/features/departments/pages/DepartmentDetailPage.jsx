import { useState } from "react";
import { Link, useParams } from "react-router";
import { Building2, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { usePermission } from "@/features/auth/usePermission";
import { EmployeeStatusBadge } from "@/features/employees/components/EmployeeStatusBadge";
import { useEmployees } from "@/features/employees/queries";
import { useDisclosure } from "@/hooks/useDisclosure";
import { getErrorMessage } from "@/lib/apiErrors";
import { AssignEmployeeModal } from "../components/AssignEmployeeModal";
import { useAssignDepartment } from "../mutations";
import { useDepartment } from "../queries";

const MEMBERS_PAGE_SIZE = 10;

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  const [page, setPage] = useState(1);
  const canManage = usePermission("departments.manage");
  const assignModal = useDisclosure();
  const toast = useToast();

  const departmentQuery = useDepartment(departmentId);
  // A DEPENDENT view: the member list is filtered by the department from the URL.
  const membersQuery = useEmployees({ department: departmentId, page, page_size: MEMBERS_PAGE_SIZE, ordering: "last_name" });
  const removeMember = useAssignDepartment();

  function handleRemove(employee) {
    removeMember.mutate(
      { employeeId: employee.id, departmentId: null },
      {
        onSuccess: () => toast.success(`${employee.full_name} was removed from the department.`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  if (departmentQuery.isPending) return <Skeleton className="h-40 w-full" />;
  if (departmentQuery.isError) {
    return (
      <Card>
        <ErrorState message={getErrorMessage(departmentQuery.error)} onRetry={departmentQuery.refetch} />
      </Card>
    );
  }

  const department = departmentQuery.data;
  const members = membersQuery.data;

  return (
    <>
      <PageHeader
        title={department.name}
        description={department.description || `Department code ${department.code}`}
        backTo="/departments"
        backLabel="Departments"
        actions={
          canManage && (
            <Button leftIcon={UserPlus} onClick={assignModal.open}>
              Assign employee
            </Button>
          )
        }
      />

      <Card>
        <CardHeader title="Members" description={`${department.employee_count} employee(s)`} />
        {membersQuery.isPending ? (
          <TableSkeleton rows={4} columns={3} />
        ) : membersQuery.isError ? (
          <ErrorState message={getErrorMessage(membersQuery.error)} onRetry={membersQuery.refetch} />
        ) : members.results.length === 0 ? (
          <EmptyState icon={Building2} title="No members yet" description="Assign employees to this department." />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {members.results.map((employee) => (
                <li key={employee.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/employees/${employee.id}`} className="text-sm font-medium hover:text-indigo-600">
                      {employee.full_name}
                    </Link>
                    <p className="text-xs text-fg-muted">{employee.job_title}</p>
                  </div>
                  <EmployeeStatusBadge status={employee.status} />
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${employee.full_name} from department`}
                      isLoading={removeMember.isPending && removeMember.variables?.employeeId === employee.id}
                      onClick={() => handleRemove(employee)}
                    >
                      <UserMinus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={page} pageSize={MEMBERS_PAGE_SIZE} count={members.count} onPageChange={setPage} />
          </>
        )}
      </Card>

      {canManage && <AssignEmployeeModal isOpen={assignModal.isOpen} onClose={assignModal.close} department={department} />}
    </>
  );
}
