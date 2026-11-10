import { usePermission } from "../usePermission";

export function Can({ permission, fallback = null, children }) {
  return usePermission(permission) ? children : fallback;
}
