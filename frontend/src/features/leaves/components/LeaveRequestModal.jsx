import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextAreaField } from "@/components/form/TextAreaField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { LEAVE_TYPE_OPTIONS } from "@/lib/constants";
import { countDays, toISODate } from "@/lib/format";
import { useCreateLeave } from "../mutations";
import { LEAVE_FIELD_NAMES, leaveRequestSchema } from "../schemas";

export function LeaveRequestModal({ isOpen, onClose, onCreated }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request leave" description="Your request goes to HR for approval.">
      <LeaveRequestForm onDone={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function LeaveRequestForm({ onDone, onCreated }) {
  const toast = useToast();
  const createLeave = useCreateLeave();
  const today = toISODate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { leave_type: "", start_date: today, end_date: today, reason: "" },
  });

  // useWatch subscribes to specific fields. Only this component re-renders as dates change.
  const [startDate, endDate] = useWatch({ control, name: ["start_date", "end_date"] });
  const dayCount = countDays(startDate, endDate);

  async function onSubmit(values) {
    try {
      await createLeave.mutateAsync(values);
      toast.success(`Leave request for ${dayCount} day(s) submitted.`);
      onCreated?.();
      onDone();
    } catch (error) {
      // Overlaps come back as {"start_date": [...]}; a missing profile as non_field_errors.
      setFormErrors(error, setError, LEAVE_FIELD_NAMES);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <SelectField label="Leave type" required placeholder="Select a type" options={LEAVE_TYPE_OPTIONS} error={errors.leave_type?.message} {...register("leave_type")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Start date" type="date" required error={errors.start_date?.message} {...register("start_date")} />
        <TextField label="End date" type="date" required min={startDate} error={errors.end_date?.message} {...register("end_date")} />
      </div>
      <p className="text-sm text-fg-muted" aria-live="polite">
        {dayCount > 0 ? `${dayCount} calendar day(s)` : "Choose a valid date range"}
      </p>
      <TextAreaField label="Reason" required rows={3} error={errors.reason?.message} {...register("reason")} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Submit request
        </Button>
      </div>
    </form>
  );
}
