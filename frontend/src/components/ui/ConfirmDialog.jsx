import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  isLoading = false,
}) {
  // While the request runs, Escape/backdrop must not close the dialog mid-delete.
  const handleClose = isLoading ? () => {} : onClose;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === "danger" && <TriangleAlert className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />}
        <p className="text-sm text-fg-muted">{message}</p>
      </div>
    </Modal>
  );
}
