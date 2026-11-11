import { useState } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { EMPLOYEE_STATUS_OPTIONS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";

const selectClasses = "h-10 rounded-lg border border-line bg-surface px-3 text-sm shadow-sm";

export function EmployeeFilters({ filters, onChange, onReset, departments, hasActiveFilters }) {
  // Local UI state: what's typed right now. The URL holds the debounced, "committed" value.
  const [searchText, setSearchText] = useState(filters.search);

  // If the URL's search changes from OUTSIDE this input (back button, a link, "Clear filters"),
  // copy it into the local text. This is React's "adjust state when a prop changes" pattern:
  // a setState during render, guarded by a comparison, with no effect and no extra paint.
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search);
    if (filters.search !== searchText.trim()) setSearchText(filters.search);
  }

  const commitSearch = useDebouncedCallback((value) => onChange({ search: value.trim() }), SEARCH_DEBOUNCE_MS);

  function handleSearchChange(value) {
    setSearchText(value); // instant feedback in the input
    commitSearch(value); // one API call once typing pauses
  }

  function handleReset() {
    setSearchText("");
    onReset();
  }

  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
      <SearchInput
        value={searchText}
        onChange={handleSearchChange}
        placeholder="Search name, email, ID or title…"
        label="Search employees"
        className="lg:max-w-sm lg:flex-1"
      />
      <select
        aria-label="Filter by department"
        value={filters.department}
        onChange={(event) => onChange({ department: event.target.value })}
        className={selectClasses}
      >
        <option value="">All departments</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        className={selectClasses}
      >
        <option value="">All statuses</option>
        {EMPLOYEE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasActiveFilters && (
        <Button variant="ghost" leftIcon={FilterX} onClick={handleReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
