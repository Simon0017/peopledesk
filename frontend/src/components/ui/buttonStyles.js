import { cn } from "@/lib/cn";

// Complete class strings (never built dynamically) so Tailwind can find them.
const VARIANTS = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
  secondary: "border border-line bg-surface text-fg shadow-sm hover:bg-surface-muted",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-500",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
};

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
    "disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
