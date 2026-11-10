import { apiClient } from "@/lib/apiClient";

export const authApi = {
  login: async (credentials) => (await apiClient.post("/auth/login/", credentials)).data,
  me: async () => (await apiClient.get("/auth/me/")).data,
  updateMe: async (data) => (await apiClient.patch("/auth/me/", data)).data,
  changePassword: async (data) => {
    await apiClient.post("/auth/change-password/", data);
  },
  logout: async (refresh) => {
    await apiClient.post("/auth/logout/", { refresh });
  },
};
