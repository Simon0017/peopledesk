import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextAreaField } from "@/components/form/TextAreaField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { useSaveDepartment } from "../mutations";
import { DEPARTMENT_FIELD_NAMES, departmentSchema } from "../schemas";

/** `department` = the department to edit, or null to create one. */
export function DepartmentFormModal({ isOpen, onClose, department }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? "Edit department" : "New department"}
      description="Departments group employees for reporting and approvals."
    >
      {/* Modal renders nothing while closed, so DepartmentForm UNMOUNTS on close and
          mounts fresh on open: its form state resets without any reset() call. */}
      <DepartmentForm department={department} onDone={onClose} />
    </Modal>
  );
}

function DepartmentForm({ department, onDone }) {
  const toast = useToast();
  const saveDepartment = useSaveDepartment();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? "",
      description: department?.description ?? "",
    },
  });

  async function onSubmit(values) {
    try {
      const saved = await saveDepartment.mutateAsync({ id: department?.id, data: values });
      toast.success(department ? `${saved.name} was updated.` : `${saved.name} was created.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, DEPARTMENT_FIELD_NAMES); // e.g. duplicate code → under the Code field
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField label="Name" required error={errors.name?.message} {...register("name")} />
        <TextField label="Code" required hint="e.g. ENG" error={errors.code?.message} {...register("code")} />
      </div>
      <TextAreaField label="Description" rows={3} error={errors.description?.message} {...register("description")} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {department ? "Save changes" : "Create department"}
        </Button>
      </div>
    </form>
  );
}
