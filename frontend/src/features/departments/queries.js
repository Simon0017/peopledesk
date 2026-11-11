import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { departmentsApi } from "./api";

const DEPARTMENTS_STALE_MS = 5 * 60_000; // departments rarely change: cache them longer

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn: ({ signal }) => departmentsApi.list({ signal }),
    staleTime: DEPARTMENTS_STALE_MS,
  });
}

export function useDepartment(id) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: ({ signal }) => departmentsApi.get(id, { signal }),
    enabled: Boolean(id),
  });
}
