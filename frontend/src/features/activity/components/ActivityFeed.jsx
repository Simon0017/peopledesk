import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative } from "@/lib/format";

export function ActivityFeed({ items }) {
  if (items.length === 0) {
    return <EmptyState icon={Activity} title="No activity yet" description="Changes will appear here." />;
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 px-5 py-3.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm">{item.description}</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {item.actor_name} · <time dateTime={item.created_at}>{formatRelative(item.created_at)}</time>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
