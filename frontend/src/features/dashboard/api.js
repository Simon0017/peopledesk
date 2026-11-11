import { apiClient } from "@/lib/apiClient";

export const dashboardApi = {
  stats: async ({ signal } = {}) => (await apiClient.get("/dashboard/stats/", { signal })).data,
};
