import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useUiStore } from "@/stores/uiStore";

export const DEFAULT_EMPLOYEE_ORDERING = "last_name";

/** Reads and writes the employee list filters from the URL query string. */
export function useEmployeeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPageSize = useUiStore((state) => state.pageSize);

  // useMemo keeps the SAME object while the URL is unchanged. It's used in a
  // query key and as an effect dependency, so a new object every render would refire them.
  const filters = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      page_size: Number(searchParams.get("page_size")) || defaultPageSize,
      search: searchParams.get("search") ?? "",
      department: searchParams.get("department") ?? "",
      status: searchParams.get("status") ?? "",
      ordering: searchParams.get("ordering") ?? DEFAULT_EMPLOYEE_ORDERING,
    }),
    [searchParams, defaultPageSize],
  );

  const setFilters = useCallback(
    (updates) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(updates)) {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
          }
          // Changing any filter other than the page sends you back to page 1.
          if (!("page" in updates)) next.delete("page");
          return next;
        },
        { replace: true }, // typing in search shouldn't create dozens of history entries
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const hasActiveFilters = Boolean(filters.search || filters.department || filters.status);

  return { filters, setFilters, resetFilters, hasActiveFilters };
}
