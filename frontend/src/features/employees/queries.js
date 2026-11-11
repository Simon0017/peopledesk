import { keepPreviousData, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { employeesApi } from "./api";

const PREFETCH_STALE_MS = 60_000;

/**
 * queryOptions() bundles key + fn so the SAME definition is used by useQuery,
 * prefetchQuery and tests. A key can never be paired with the wrong function.
 * TanStack passes an AbortSignal: if the key changes mid-request, it's cancelled.
 */
export function employeeListQuery(filters) {
  return queryOptions({
    queryKey: queryKeys.employees.list(filters),
    queryFn: ({ signal }) => employeesApi.list(filters, { signal }),
  });
}

export function employeeDetailQuery(id) {
  return queryOptions({
    queryKey: queryKeys.employees.detail(id),
    queryFn: ({ signal }) => employeesApi.get(id, { signal }),
  });
}

export function useEmployees(filters, { enabled = true } = {}) {
  return useQuery({
    ...employeeListQuery(filters),
    placeholderData: keepPreviousData, // no skeleton flash between pages or filters
    enabled,
  });
}

export function useEmployee(id) {
  const queryClient = useQueryClient();
  return useQuery({
    ...employeeDetailQuery(id),
    enabled: Boolean(id),
    // Arriving from the list? Show the row we already have while the full record loads.
    placeholderData: () => {
      const cachedPages = queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() });
      for (const [, page] of cachedPages) {
        const match = page?.results?.find((employee) => String(employee.id) === String(id));
        if (match) return match;
      }
      return undefined;
    },
  });
}

/** Returns a stable callback that warms the cache for an employee (e.g. on row hover). */
export function usePrefetchEmployee() {
  const queryClient = useQueryClient();
  return useCallback(
    (id) => queryClient.prefetchQuery({ ...employeeDetailQuery(id), staleTime: PREFETCH_STALE_MS }),
    [queryClient],
  );
}

/** Fetches the next page in the background, so clicking "Next" feels instant. */
export function usePrefetchNextEmployeesPage(filters, hasNextPage) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!hasNextPage) return;
    queryClient.prefetchQuery(employeeListQuery({ ...filters, page: filters.page + 1 }));
  }, [queryClient, filters, hasNextPage]);
}
