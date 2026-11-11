import { apiClient } from "@/lib/apiClient";

export const usersApi = {
  list: async ({ signal } = {}) => (await apiClient.get("/users/", { signal })).data, // array, not paginated
  create: async (data) => (await apiClient.post("/users/", data)).data,
  update: async (id, data) => (await apiClient.patch(`/users/${id}/`, data)).data,
  remove: async (id) => {
    await apiClient.delete(`/users/${id}/`);
  },
};
