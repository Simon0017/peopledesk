import { useContext } from "react";
import { ToastContext } from "./toastContext";

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) {
    // Fail loudly: a missing provider is a wiring bug, not a runtime condition.
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return toast;
}
