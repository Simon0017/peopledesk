import { useEffect, useMemo, useReducer, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleX, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { TOAST_DURATION_MS } from "@/lib/constants";
import { ToastContext } from "./toastContext";

const MAX_VISIBLE_TOASTS = 4;

// Pure reducer: every way the toast list can change is listed here.
function toastReducer(toasts, action) {
  switch (action.type) {
    case "added":
      return [...toasts, action.toast].slice(-MAX_VISIBLE_TOASTS); // keep only the newest few
    case "dismissed":
      return toasts.filter((toast) => toast.id !== action.id);
    default:
      throw new Error(`Unknown toast action: ${action.type}`);
  }
}

const TONE_STYLES = {
  success: { icon: CircleCheck, className: "text-green-600 dark:text-green-400" },
  error: { icon: CircleX, className: "text-red-600 dark:text-red-400" },
  info: { icon: Info, className: "text-sky-600 dark:text-sky-400" },
};

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextIdRef = useRef(0);

  // The API object is created ONCE. Components that only call toast.success(...)
  // never re-render when toasts appear or disappear, because the context value never changes.
  const api = useMemo(() => {
    function show(tone, message, { duration = TOAST_DURATION_MS } = {}) {
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      dispatch({ type: "added", toast: { id, tone, message, duration } });
      return id;
    }
    return {
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
      dismiss: (id) => dispatch({ type: "dismissed", id }),
    };
  }, []);

  return (
    <ToastContext value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={api.dismiss} />
    </ToastContext>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, className } = TONE_STYLES[toast.tone];

  // Each toast schedules its own removal; cleanup cancels it if dismissed early.
  useEffect(() => {
    const timeoutId = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timeoutId);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} aria-hidden="true" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-0.5 text-fg-muted hover:text-fg"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
