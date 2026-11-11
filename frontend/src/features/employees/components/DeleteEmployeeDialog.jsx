import { useToast } from "@/components/feedback/useToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/apiErrors";
import { useDeleteEmployee } from "../mutations";

/** Open when `employee` is set. Owns the delete mutation, so every caller gets the same behaviour. */
export function DeleteEmployeeDialog({ employee, onClose, onDeleted }) {
  const deleteEmployee = useDeleteEmployee();
  const toast = useToast();

  function handleConfirm() {
    deleteEmployee.mutate(employee.id, {
      onSuccess: () => {
        toast.success(`${employee.full_name} was deleted.`);
        onClose();
        onDeleted?.();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      isOpen={Boolean(employee)}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete employee?"
      message={`This permanently deletes ${employee?.full_name ?? "this employee"}, including their leave history. This can't be undone.`}
      confirmLabel="Delete employee"
      isLoading={deleteEmployee.isPending}
    />
  );
}
