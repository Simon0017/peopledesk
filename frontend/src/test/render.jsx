import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { useAuthStore } from "@/features/auth/authStore";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUiStore } from "@/stores/uiStore";

/** A fresh client per test: no shared cache and no retries (failures show immediately). */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

/** Puts the global stores into a known state. Stores are module singletons, so reset them per test. */
export function setTestSession(user) {
  useAuthStore.setState({
    user,
    accessToken: user ? "test-access" : null,
    refreshToken: user ? "test-refresh" : null,
    isReady: true,
  });
  useUiStore.setState({ theme: "light", sidebarCollapsed: false, pageSize: DEFAULT_PAGE_SIZE, density: "comfortable" });
}

/**
 * Renders `ui` with the same providers as the real app, but with MemoryRouter
 * (the URL lives in memory) and a fresh QueryClient.
 */
export function renderWithProviders(ui, { route = "/", user = null } = {}) {
  setTestSession(user);
  const queryClient = createTestQueryClient();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{ui}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), queryClient, ...utils };
}
