import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { useAuthStore } from "@/features/auth/authStore";
import { TEST_PASSWORD } from "@/test/handlers";
import { renderWithProviders } from "@/test/render";
import LoginPage from "./LoginPage";

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>Dashboard home</p>} />
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginPage", () => {
  it("shows validation errors when submitted empty", async () => {
    const { user } = renderLogin();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("signs in, stores the user and redirects to the dashboard", async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/^email/i), "hr@peopledesk.test");
    await user.type(screen.getByLabelText(/^password/i), TEST_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
    expect(useAuthStore.getState().user.email).toBe("hr@peopledesk.test");
  });

  it("shows a friendly message for wrong credentials", async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/^email/i), "hr@peopledesk.test");
    await user.type(screen.getByLabelText(/^password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
