import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

// Shares the menu's `close` function with every DropdownItem inside it.
const DropdownContext = createContext(null);

export function Dropdown({ label, triggerContent, triggerVariant = "ghost", triggerSize = "sm", align = "end", children }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useClickOutside(containerRef, close, isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        variant={triggerVariant}
        size={triggerSize}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {triggerContent}
      </Button>
      {isOpen && (
        // React 19: a context object can be rendered directly as its provider.
        <DropdownContext value={close}>
          <div
            id={menuId}
            role="menu"
            className={cn(
              "absolute z-30 mt-2 min-w-48 rounded-lg border border-line bg-surface p-1 shadow-lg",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {children}
          </div>
        </DropdownContext>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, onSelect, tone = "default", children }) {
  const close = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        close?.();
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted",
        tone === "danger" ? "text-red-600 dark:text-red-400" : "text-fg",
      )}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
