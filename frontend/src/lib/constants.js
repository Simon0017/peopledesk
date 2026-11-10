export const APP_NAME = "PeopleDesk";

export const ROLES = Object.freeze({ ADMIN: "ADMIN", HR: "HR", EMPLOYEE: "EMPLOYEE" });
export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.HR, label: "HR" },
  { value: ROLES.EMPLOYEE, label: "Employee" },
];

export const EMPLOYEE_STATUS = Object.freeze({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", ON_LEAVE: "ON_LEAVE" });
export const EMPLOYEE_STATUS_OPTIONS = [
  { value: EMPLOYEE_STATUS.ACTIVE, label: "Active" },
  { value: EMPLOYEE_STATUS.INACTIVE, label: "Inactive" },
  { value: EMPLOYEE_STATUS.ON_LEAVE, label: "On leave" },
];

export const LEAVE_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});
export const LEAVE_STATUS_OPTIONS = [
  { value: LEAVE_STATUS.PENDING, label: "Pending" },
  { value: LEAVE_STATUS.APPROVED, label: "Approved" },
  { value: LEAVE_STATUS.REJECTED, label: "Rejected" },
  { value: LEAVE_STATUS.CANCELLED, label: "Cancelled" },
];

export const LEAVE_TYPE_OPTIONS = [
  { value: "ANNUAL", label: "Annual" },
  { value: "SICK", label: "Sick" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "OTHER", label: "Other" },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 400;
export const TOAST_DURATION_MS = 4000;
export const DASHBOARD_REFRESH_MS = 60_000;

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // matches the backend limit
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_EMERGENCY_CONTACTS = 5;

/** Finds the human label for a value in an options array, falling back to the raw value. */
export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}
