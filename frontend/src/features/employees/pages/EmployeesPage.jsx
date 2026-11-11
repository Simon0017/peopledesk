import { useCallback, useState } from "react";
import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useCan } from "@/features/auth/usePermission";
import { useDepartments } from "@/features/departments/queries";
import { getErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/uiStore";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { EmployeeFilters } from "../components/EmployeeFilters";
import { EmployeeTable } from "../components/EmployeeTable";
import { useEmployeeFilters } from "../hooks/useEmployeeFilters";
import { useUpdateEmployeeStatus } from "../mutations";
import { useEmployees, usePrefetchEmployee, usePrefetchNextEmployeesPage } from "../queries";

export default function EmployeesPage() {
  const { filters, setFilters, resetFilters, hasActiveFilters } = useEmployeeFilters();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useEmployees(filters);
  const { data: departments } = useDepartments();
  const prefetchEmployee = usePrefetchEmployee();
  usePrefetchNextEmployeesPage(filters, Boolean(data?.next));
  const { mutate: updateStatus } = useUpdateEmployeeStatus(); // `mutate` is a stable function
  const can = useCan();
  const toast = useToast();
  const density = useUiStore((state) => state.density);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // useCallback keeps these identities stable, so memoised EmployeeRows don't all re-render.
  const handleStatusChange = useCallback(
    (id, status) => updateStatus({ id, status }, { onError: (err) => toast.error(getErrorMessage(err)) }),
    [updateStatus, toast],
  );
  const handleDeleteRequest = useCallback((employee) => setEmployeeToDelete(employee), []);

  function handleDeleted() {
    // Deleting the only row on the last page would leave an empty page: step back one.
    if (data?.results.length === 1 && filters.page > 1) setFilters({ page: filters.page - 1 });
  }

  let content;
  if (isPending) {
    content = <TableSkeleton rows={8} columns={6} />;
  } else if (isError) {
    content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (data.results.length === 0) {
    content = hasActiveFilters ? (
      <EmptyState title="No employees match your filters" description="Try a different search or clear the filters." />
    ) : (
      <EmptyState icon={Users} title="No employees yet" description="Add your first employee to get started." />
    );
  } else {
    content = (
      <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
        <EmployeeTable
          employees={data.results}
          ordering={filters.ordering}
          onSort={(ordering) => setFilters({ ordering })}
          density={density}
          canManage={can("employees.manage")}
          canDelete={can("employees.delete")}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRequest}
          onPrefetch={prefetchEmployee}
        />
        <Pagination
          page={filters.page}
          pageSize={filters.page_size}
          count={data.count}
          onPageChange={(page) => setFilters({ page })}
          onPageSizeChange={(page_size) => setFilters({ page_size })}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description={data ? `${data.count} people in the directory` : "Your company directory"}
        actions={
          <>
            {isFetching && !isPending && <Spinner className="h-4 w-4 text-fg-muted" />}
            {can("employees.manage") && (
              <Link to="/employees/new" className={buttonClasses()}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add employee
              </Link>
            )}
          </>
        }
      />
      <Card>
        <EmployeeFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          departments={departments ?? []}
          hasActiveFilters={hasActiveFilters}
        />
        {content}
      </Card>
      <DeleteEmployeeDialog employee={employeeToDelete} onClose={() => setEmployeeToDelete(null)} onDeleted={handleDeleted} />
    </>
  );
}
