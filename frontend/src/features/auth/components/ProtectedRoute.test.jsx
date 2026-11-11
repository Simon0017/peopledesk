import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { employeeUser, hrUser } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

function renderAt(route, user) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login screen</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/employees" element={<p>Employees screen</p>} />
        <Route element={<RoleRoute permission="leaves.review" />}>
          <Route path="/approvals" element={<p>Approvals screen</p>} />
        </Route>
      </Route>
    </Routes>,
    { route, user },
  );
}

describe("route guards", () => {
  it("redirects anonymous visitors to the login page", () => {
    renderAt("/employees", null);
    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("shows protected pages to signed-in users", () => {
    renderAt("/employees", employeeUser);
    expect(screen.getByText("Employees screen")).toBeInTheDocument();
  });

  it("shows the forbidden page when the role lacks the permission", () => {
    renderAt("/approvals", employeeUser);
    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument();
  });

  it("lets HR into the approvals page", () => {
    renderAt("/approvals", hrUser);
    expect(screen.getByText("Approvals screen")).toBeInTheDocument();
  });
});
