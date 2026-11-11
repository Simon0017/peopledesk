import { apiClient } from "@/lib/apiClient";

export const departmentsApi = {
  /** Not paginated: returns an array. */
  list: async ({ signal } = {}) => (await apiClient.get("/departments/", { signal })).data,
  get: async (id, { signal } = {}) => (await apiClient.get(`/departments/${id}/`, { signal })).data,
  create: async (data) => (await apiClient.post("/departments/", data)).data,
  update: async (id, data) => (await apiClient.patch(`/departments/${id}/`, data)).data,
  remove: async (id) => {
    await apiClient.delete(`/departments/${id}/`);
  },
};
