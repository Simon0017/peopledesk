import { useEffect } from "react";
import { FullPageLoader } from "@/components/feedback/Loaders";
import { refreshAccessToken } from "@/lib/apiClient";
import { authApi } from "../api";
import { useAuthStore } from "../authStore";

/**
 * On first load, exchanges the persisted refresh token for an access token and
 * loads the user, BEFORE any route renders. Route guards therefore never see a
 * "logged out" flicker for a user who is actually logged in.
 */
export function AuthBootstrap({ children }) {
  const isReady = useAuthStore((state) => state.isReady);

  useEffect(() => {
    // `ignore` protects against setting state from a stale run. In Strict Mode this
    // effect runs twice; both runs share ONE refresh request (see refreshAccessToken),
    // and only the second run's results are applied.
    let ignore = false;

    async function restoreSession() {
      const { refreshToken, setUser, clearSession, markReady } = useAuthStore.getState();
      if (!refreshToken) {
        markReady();
        return;
      }
      try {
        await refreshAccessToken();
        const user = await authApi.me();
        if (!ignore) setUser(user);
      } catch {
        if (!ignore) clearSession(); // expired or revoked: start logged out
      } finally {
        if (!ignore) markReady();
      }
    }

    restoreSession();
    return () => {
      ignore = true;
    };
  }, []);

  if (!isReady) return <FullPageLoader label="Restoring your session…" />;
  return children;
}
