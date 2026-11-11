import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/apiClient";
import { departments, employees, hrUser, paginate } from "./fixtures";

export const TEST_PASSWORD = "ChangeMe123!";

export const handlers = [
  http.post(`${API_URL}/auth/login/`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === hrUser.email && password === TEST_PASSWORD) {
      return HttpResponse.json({ access: "test-access", refresh: "test-refresh" });
    }
    return HttpResponse.json({ detail: "No active account found with the given credentials" }, { status: 401 });
  }),

  http.get(`${API_URL}/auth/me/`, () => HttpResponse.json(hrUser)),

  http.get(`${API_URL}/departments/`, () => HttpResponse.json(departments)),

  // A tiny fake of DRF's search, so tests can check server-side filtering.
  http.get(`${API_URL}/employees/`, ({ request }) => {
    const search = (new URL(request.url).searchParams.get("search") ?? "").toLowerCase();
    return HttpResponse.json(paginate(employees.filter((employee) => employee.full_name.toLowerCase().includes(search))));
  }),

  http.get(`${API_URL}/employees/:id/`, ({ params }) => {
    const employee = employees.find((item) => String(item.id) === params.id);
    return employee ? HttpResponse.json(employee) : HttpResponse.json({ detail: "Not found." }, { status: 404 });
  }),

  http.patch(`${API_URL}/employees/:id/`, async ({ params, request }) => {
    const employee = employees.find((item) => String(item.id) === params.id);
    return HttpResponse.json({ ...employee, ...(await request.json()) });
  }),

  http.delete(`${API_URL}/employees/:id/`, () => new HttpResponse(null, { status: 204 })),
];
