import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

/** Optional header slot. `actions` is any JSX, e.g. buttons. */
export function CardHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
