import { authApi } from "./api";
import { useAuthStore } from "./authStore";

/** Exchanges credentials for tokens, then loads the user. */
export async function login(credentials) {
  const { setTokens, setUser, clearSession } = useAuthStore.getState();
  const tokens = await authApi.login(credentials);
  setTokens(tokens);
  try {
    setUser(await authApi.me());
  } catch (error) {
    clearSession(); // don't leave a half-logged-in session behind
    throw error;
  }
}

/** Blacklists the refresh token on the server (best effort), then clears the session. */
export async function logout() {
  const { refreshToken, clearSession } = useAuthStore.getState();
  try {
    if (refreshToken) await authApi.logout(refreshToken);
  } catch {
    // Even if the server call fails, the user must be logged out locally.
  } finally {
    clearSession(); // route guards redirect; queryClient.js clears the cache
  }
}
