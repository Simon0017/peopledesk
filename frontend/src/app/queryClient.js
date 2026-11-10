import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/authStore";

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data counts as fresh for 30s: no refetch on remount in that window
      gcTime: 5 * 60_000, // unused cache entries are garbage-collected after 5 minutes
      refetchOnWindowFocus: true, // come back to the tab → refresh stale data in the background
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false; // 4xx won't fix itself on retry
        return failureCount < MAX_RETRIES; // network blips and 5xx: retry with backoff
      },
    },
    mutations: { retry: false }, // never silently repeat a POST
  },
});

// Whenever the session ends (logout or a failed refresh), wipe the cache so the next
// user never sees the previous user's data.
useAuthStore.subscribe((state, previousState) => {
  if (previousState.user && !state.user) queryClient.clear();
});
