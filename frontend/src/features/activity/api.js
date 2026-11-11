import { apiClient, cleanParams } from "@/lib/apiClient";

export const activityApi = {
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/activities/", { params: cleanParams(params), signal })).data,
};
