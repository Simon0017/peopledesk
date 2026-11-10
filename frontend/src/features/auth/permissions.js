import { ROLES } from "@/lib/constants";

const { ADMIN, HR, EMPLOYEE } = ROLES;

/**
 * Which roles may do what. Mirrors the backend permission classes.
 * IMPORTANT: this only shapes the UI. The API enforces the real rules;
 * hiding a button is not security.
 */
export const PERMISSIONS = {
  "employees.manage": [ADMIN, HR],
  "employees.delete": [ADMIN],
  "employees.viewHistory": [ADMIN, HR],
  "departments.manage": [ADMIN, HR],
  "leaves.review": [ADMIN, HR],
  "activity.view": [ADMIN, HR],
  "users.manage": [ADMIN],
  "leaves.request": [ADMIN, HR, EMPLOYEE],
};

export function hasPermission(user, permission) {
  if (!user) return false;
  return PERMISSIONS[permission]?.includes(user.role) ?? false;
}
