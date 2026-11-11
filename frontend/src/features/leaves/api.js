import { apiClient, cleanParams } from "@/lib/apiClient";

export const leavesApi = {
  /** Paginated. Employees only ever receive their own requests (enforced by the API). */
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/leaves/", { params: cleanParams(params), signal })).data,
  create: async (data) => (await apiClient.post("/leaves/", data)).data,
  /** decision: "approve" | "reject" */
  review: async (id, decision, data) => (await apiClient.post(`/leaves/${id}/${decision}/`, data)).data,
  cancel: async (id) => (await apiClient.post(`/leaves/${id}/cancel/`)).data,
};
