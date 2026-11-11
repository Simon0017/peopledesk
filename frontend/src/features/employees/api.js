import { apiClient, cleanParams } from "@/lib/apiClient";

export const employeesApi = {
  /** GET /employees/?page&page_size&search&department&status&ordering → paginated envelope */
  list: async (params, { signal } = {}) =>
    (await apiClient.get("/employees/", { params: cleanParams(params), signal })).data,

  get: async (id, { signal } = {}) => (await apiClient.get(`/employees/${id}/`, { signal })).data,

  /** `data` is FormData (multipart, for the photo). Axios sets the Content-Type boundary. */
  create: async (data) => (await apiClient.post("/employees/", data)).data,

  /** `data` can be FormData (full form) or a plain object (e.g. { status }) sent as JSON. */
  update: async (id, data) => (await apiClient.patch(`/employees/${id}/`, data)).data,

  remove: async (id) => {
    await apiClient.delete(`/employees/${id}/`);
  },
};
