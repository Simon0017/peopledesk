import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePermission } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { DepartmentCard } from "../components/DepartmentCard";
import { DepartmentFormModal } from "../components/DepartmentFormModal";
import { useDeleteDepartment } from "../mutations";
import { useDepartments } from "../queries";

export default function DepartmentsPage() {
  const { data: departments, isPending, isError, error, refetch } = useDepartments();
  const canManage = usePermission("departments.manage");
  const deleteDepartment = useDeleteDepartment();
  const toast = useToast();

  const [search, setSearch] = useState("");
  // One piece of state describes the modal: closed (null), creating ({ department: null }) or editing.
  const [formState, setFormState] = useState(null);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // A short, already-loaded list: filtering on the client is simpler than a server round trip.
  const query = search.trim().toLowerCase();
  const visibleDepartments = (departments ?? []).filter(
    (department) => department.name.toLowerCase().includes(query) || department.code.toLowerCase().includes(query),
  );

  function handleConfirmDelete() {
    deleteDepartment.mutate(departmentToDelete.id, {
      onSuccess: () => {
        toast.success(`${departmentToDelete.name} was deleted.`);
        setDepartmentToDelete(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  let content;
  if (isPending) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <Card>
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </Card>
    );
  } else if (visibleDepartments.length === 0) {
    content = (
      <Card>
        <EmptyState icon={Building2} title={query ? "No matching departments" : "No departments yet"} />
      </Card>
    );
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDepartments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            canManage={canManage}
            onEdit={(selected) => setFormState({ department: selected })}
            onDelete={setDepartmentToDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Departments"
        description="How your organisation is structured."
        actions={
          canManage && (
            <Button leftIcon={Plus} onClick={() => setFormState({ department: null })}>
              New department
            </Button>
          )
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Filter departments…" label="Filter departments" className="mb-5 max-w-sm" />
      {content}

      <DepartmentFormModal isOpen={formState !== null} onClose={() => setFormState(null)} department={formState?.department ?? null} />
      <ConfirmDialog
        isOpen={Boolean(departmentToDelete)}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteDepartment.isPending}
        title="Delete department?"
        message={`${departmentToDelete?.name ?? "This department"} will be deleted. Its ${departmentToDelete?.employee_count ?? 0} employee(s) will become unassigned.`}
        confirmLabel="Delete department"
      />
    </>
  );
}
