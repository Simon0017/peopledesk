import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { queryClient } from "./queryClient";
import { ThemeSync } from "./ThemeSync";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <ThemeSync />
          {children}
        </ToastProvider>
      </BrowserRouter>
      {/* Devtools are excluded from production builds automatically. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
