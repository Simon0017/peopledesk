import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEmployees } from "@/features/employees/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/apiErrors";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { useAssignDepartment } from "../mutations";

const RESULTS_LIMIT = 8;

export function AssignEmployeeModal({ isOpen, onClose, department }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign to ${department.name}`} description="Search for an employee to move into this department.">
      <AssignEmployeeSearch department={department} />
    </Modal>
  );
}

// Mounted only while the modal is open, so the search box starts empty every time.
function AssignEmployeeSearch({ department }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const { data, isPending } = useEmployees({ search: debouncedSearch, page: 1, page_size: RESULTS_LIMIT, ordering: "last_name" });
  const assign = useAssignDepartment();
  const toast = useToast();

  const candidates = (data?.results ?? []).filter((employee) => employee.department !== department.id);

  function handleAssign(employee) {
    assign.mutate(
      { employeeId: employee.id, departmentId: department.id },
      {
        onSuccess: () => toast.success(`${employee.full_name} moved to ${department.name}.`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" label="Search employees" />
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState title="No employees to assign" description="Try another search." />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {candidates.map((employee) => (
            <li key={employee.id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{employee.full_name}</p>
                <p className="truncate text-xs text-fg-muted">{employee.department_name ?? "Unassigned"}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={UserPlus}
                isLoading={assign.isPending && assign.variables?.employeeId === employee.id}
                onClick={() => handleAssign(employee)}
              >
                Assign
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
