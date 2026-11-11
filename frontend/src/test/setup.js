import "@testing-library/jest-dom/vitest"; // adds toBeInTheDocument, toBeDisabled, toHaveValue...
import { server } from "./server";

// jsdom doesn't implement matchMedia, which useMediaQuery (and ThemeSync) rely on.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// "error": a request with no handler fails the test loudly instead of hitting a real server.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers(); // undo per-test server.use(...) overrides
  localStorage.clear();
});
afterAll(() => server.close());
