import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** A controlled, presentational search box. */
export function SearchInput({ value, onChange, placeholder = "Search…", label = "Search", className }) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-surface pr-9 pl-9 text-sm shadow-sm placeholder:text-fg-muted/70 focus:outline-2 focus:outline-indigo-600 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-fg-muted hover:text-fg"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </label>
  );
}
