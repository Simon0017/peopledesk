import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Steps({ steps, currentIndex }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
              state === "current" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-line bg-surface",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                state === "upcoming" ? "bg-surface-muted text-fg-muted" : "bg-indigo-600 text-white",
              )}
            >
              {state === "complete" ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn("font-medium", state === "upcoming" && "text-fg-muted")}>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
