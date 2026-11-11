import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { API_URL } from "@/lib/apiClient";
import { adminUser, employeeUser, hrUser } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";
import EmployeesPage from "./EmployeesPage";

function renderEmployees(user = hrUser) {
  return renderWithProviders(
    <Routes>
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/employees/:employeeId" element={<p>Profile page</p>} />
    </Routes>,
    { route: "/employees", user },
  );
}

describe("EmployeesPage", () => {
  it("lists employees from the API", async () => {
    renderEmployees();
    expect(await screen.findByText("Amara Okafor")).toBeInTheDocument();
    expect(screen.getByText("Liam Novak")).toBeInTheDocument();
  });

  it("searches on the server once the user stops typing", async () => {
    const { user } = renderEmployees();
    await screen.findByText("Amara Okafor");

    await user.type(screen.getByRole("searchbox", { name: "Search employees" }), "liam");

    await waitFor(() => expect(screen.queryByText("Amara Okafor")).not.toBeInTheDocument());
    expect(screen.getByText("Liam Novak")).toBeInTheDocument();
  });

  it("hides management actions from the Employee role", async () => {
    renderEmployees(employeeUser);
    await screen.findByText("Amara Okafor");
    expect(screen.queryByRole("link", { name: /add employee/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("deletes an employee after confirmation", async () => {
    let deletedId = null;
    server.use(
      http.delete(`${API_URL}/employees/:id/`, ({ params }) => {
        deletedId = params.id;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderEmployees(adminUser);

    await user.click(await screen.findByRole("button", { name: "Delete Amara Okafor" }));
    const dialog = screen.getByRole("dialog", { name: "Delete employee?" });
    await user.click(within(dialog).getByRole("button", { name: "Delete employee" }));

    await waitFor(() => expect(deletedId).toBe("1"));
    expect(await screen.findByText("Amara Okafor was deleted.")).toBeInTheDocument();
  });

  it("rolls back an optimistic status change when the server fails", async () => {
    server.use(http.patch(`${API_URL}/employees/:id/`, () => HttpResponse.json({ detail: "boom" }, { status: 500 })));
    const { user } = renderEmployees();

    const statusSelect = await screen.findByRole("combobox", { name: "Status for Amara Okafor" });
    await user.selectOptions(statusSelect, "INACTIVE");

    expect(await screen.findByText(/the server had a problem/i)).toBeInTheDocument();
    await waitFor(() => expect(statusSelect).toHaveValue("ACTIVE"));
  });
});
