import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export function Tabs({ tabs, activeTab, onChange, isPending = false, label = "Sections" }) {
  return (
    <div role="tablist" aria-label={label} className="flex items-center gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-fg-muted hover:text-fg",
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>}
        </button>
      ))}
      {isPending && <Spinner className="ml-2 h-4 w-4 text-fg-muted" />}
    </div>
  );
}
