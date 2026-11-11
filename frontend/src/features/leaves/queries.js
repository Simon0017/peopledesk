import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { leavesApi } from "./api";

export function useLeaves(filters, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.leaves.list(filters),
    queryFn: ({ signal }) => leavesApi.list(filters, { signal }),
    placeholderData: keepPreviousData,
    enabled,
  });
}
