import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextAreaField } from "@/components/form/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { setFormErrors } from "@/lib/apiErrors";
import { LEAVE_TYPE_OPTIONS, labelFor } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useReviewLeave } from "../mutations";
import { reviewSchema } from "../schemas";

/** `review` = { leave, decision: "approve" | "reject" } or null when closed. */
export function ReviewLeaveModal({ review, onClose }) {
  const title = review?.decision === "approve" ? "Approve leave" : "Reject leave";
  return (
    <Modal isOpen={Boolean(review)} onClose={onClose} title={title}>
      {review && <ReviewForm leave={review.leave} decision={review.decision} onDone={onClose} />}
    </Modal>
  );
}

function ReviewForm({ leave, decision, onDone }) {
  const toast = useToast();
  const reviewLeave = useReviewLeave();
  const isApproval = decision === "approve";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { review_note: "" } });

  async function onSubmit({ review_note }) {
    try {
      await reviewLeave.mutateAsync({ id: leave.id, decision, review_note });
      toast.success(`Leave for ${leave.employee_name} was ${isApproval ? "approved" : "rejected"}.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, ["review_note"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="rounded-lg bg-surface-muted p-4 text-sm">
        <p className="font-medium">{leave.employee_name}</p>
        <p className="text-fg-muted">
          {labelFor(LEAVE_TYPE_OPTIONS, leave.leave_type)} · {formatDate(leave.start_date)} – {formatDate(leave.end_date)} ({leave.days} day
          {leave.days === 1 ? "" : "s"})
        </p>
        <p className="mt-2">{leave.reason}</p>
      </div>
      <TextAreaField
        label={isApproval ? "Note (optional)" : "Reason for rejection"}
        rows={3}
        error={errors.review_note?.message}
        {...register("review_note")}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant={isApproval ? "primary" : "danger"} isLoading={isSubmitting}>
          {isApproval ? "Approve" : "Reject"}
        </Button>
      </div>
    </form>
  );
}
