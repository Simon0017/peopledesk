import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_REFRESH_MS } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import { dashboardApi } from "./api";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: ({ signal }) => dashboardApi.stats({ signal }),
    // Background polling: refresh every minute while the tab is visible.
    refetchInterval: DASHBOARD_REFRESH_MS,
    refetchIntervalInBackground: false, // don't poll from hidden tabs
  });
}
