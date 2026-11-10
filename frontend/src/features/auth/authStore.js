import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AUTH_STORAGE_KEY = "peopledesk-auth";

/**
 * Session state.
 * - accessToken: short-lived, kept in MEMORY only (not persisted).
 * - refreshToken: persisted, so a reload can silently restore the session.
 * - user: the /auth/me/ payload; kept here because route guards need it synchronously.
 * - isReady: false until the startup session check has finished.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isReady: false,

      // SimpleJWT rotation returns a new refresh token on every refresh; keep the old one if absent.
      setTokens: ({ access, refresh }) =>
        set((state) => ({ accessToken: access, refreshToken: refresh ?? state.refreshToken })),
      setUser: (user) => set({ user }),
      markReady: () => set({ isReady: true }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ refreshToken: state.refreshToken }), // persist ONLY this field
    },
  ),
);
