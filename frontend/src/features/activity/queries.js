import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { activityApi } from "./api";

export function useActivities(filters, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.activities.list(filters),
    queryFn: ({ signal }) => activityApi.list(filters, { signal }),
    enabled,
  });
}
