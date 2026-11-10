import { useCallback } from "react";
import { useAuthStore } from "./authStore";
import { hasPermission } from "./permissions";

/** usePermission("employees.delete") → boolean */
export function usePermission(permission) {
  const user = useAuthStore((state) => state.user);
  return hasPermission(user, permission);
}

/** const can = useCan(); can("users.manage") → boolean. Handy for several checks. */
export function useCan() {
  const user = useAuthStore((state) => state.user);
  return useCallback((permission) => hasPermission(user, permission), [user]);
}
