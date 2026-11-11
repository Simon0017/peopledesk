import { cn } from "@/lib/cn";

export function inputClasses(hasError, className) {
  return cn(
    "block w-full rounded-lg border bg-surface px-3 text-sm text-fg shadow-sm placeholder:text-fg-muted/70",
    "focus:outline-2 focus:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
    hasError ? "border-red-500 focus:outline-red-500" : "border-line focus:outline-indigo-600",
    className,
  );
}
