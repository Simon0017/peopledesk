import axios from "axios";
import { useAuthStore } from "@/features/auth/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const REQUEST_TIMEOUT_MS = 15_000;

/** The client every feature uses. */
export const apiClient = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

/** A bare client for the refresh call, so it never goes through the 401 interceptor below. */
const refreshClient = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

/** Drops empty values so `?search=&status=` never reaches the server. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

// ---------------------------------------------------------------------------
// Token refresh, de-duplicated.
// If five requests fail with 401 at once, they must share ONE refresh call. With
// refresh-token rotation, a second refresh using the same (now blacklisted)
// token would fail and log the user out. Strict Mode's double effects would
// trigger exactly that on startup.
// ---------------------------------------------------------------------------
let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return Promise.reject(new Error("No refresh token"));

    refreshPromise = refreshClient
      .post("/auth/refresh/", { refresh: refreshToken })
      .then(({ data }) => {
        useAuthStore.getState().setTokens(data);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null; // allow future refreshes
      });
  }
  return refreshPromise;
}

// REQUEST interceptor: attach the access token to every call.
apiClient.interceptors.request.use((config) => {
  // getState() reads the store outside React, without subscribing.
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// RESPONSE interceptor: on 401, refresh once and replay the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith("/auth/login") || original?.url?.startsWith("/auth/refresh");
    const canRetry =
      error.response?.status === 401 &&
      original &&
      !original._retry && // never loop
      !isAuthCall &&
      useAuthStore.getState().refreshToken;

    if (!canRetry) return Promise.reject(error);

    original._retry = true;
    try {
      const access = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original); // the caller never knows a refresh happened
    } catch (refreshError) {
      // The refresh token is expired or blacklisted: end the session. The route
      // guard (Phase 10) then sends the user to the login page.
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);
