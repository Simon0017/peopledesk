import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLatest } from "@/hooks/useLatest";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };
const FOCUSABLE =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab cycling inside the dialog. */
function trapFocus(event, container) {
  const items = [...container.querySelectorAll(FOCUSABLE)];
  if (items.length === 0) return;
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Modal({ isOpen, onClose, title, description, footer, size = "md", children }) {
  // All hooks run BEFORE the early `return null` below (Rules of Hooks).
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  // Parents often pass inline arrows (a new function every render). Reading the
  // latest one from a ref means the effect below doesn't re-run on every render,
  // which would otherwise steal focus back to the first input on each keystroke.
  const onCloseRef = useLatest(onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;

    // Move focus into the dialog: first field in the body, or the panel itself.
    (bodyRef.current?.querySelector(FOCUSABLE) ?? panel)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab") trapFocus(event, panel);
    }
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // stop the page scrolling behind the modal

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.(); // give focus back to whatever opened the modal
    };
  }, [isOpen, onCloseRef]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={() => onCloseRef.current()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col rounded-xl border border-line bg-surface shadow-xl outline-none",
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close dialog" onClick={() => onCloseRef.current()}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div ref={bodyRef} className="overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && <div className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
