import axios from "axios";

/** DRF error values can be strings, arrays or nested objects. Find the first message. */
function firstMessage(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? firstMessage(value[0]) : null;
  if (value && typeof value === "object") return firstMessage(Object.values(value)[0]);
  return null;
}

/** Turns any error into one sentence suitable for a toast or alert. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") return "The request was cancelled.";
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The server took too long to respond."
        : "Can't reach the server. Check your connection.";
    }
    const { status, data } = error.response;
    if (status >= 500) return "The server had a problem. Please try again shortly.";
    if (status === 403 && !data?.detail) return "You don't have permission to do that.";
    if (data && typeof data === "object") {
      return firstMessage(data.detail) ?? firstMessage(data.non_field_errors) ?? firstMessage(data) ?? fallback;
    }
    return fallback;
  }
  return error?.message || fallback;
}

/**
 * Maps a DRF 400 response onto React Hook Form fields.
 * `{"email": ["already exists"]}` → setError("email", ...).
 * Anything that isn't a known field becomes a form-level error in `errors.root.serverError`.
 * Returns the names of the fields that received an error.
 */
export function setFormErrors(error, setError, fieldNames = []) {
  const data = error?.response?.status === 400 ? error.response.data : null;
  const appliedFields = [];

  if (data && typeof data === "object") {
    for (const field of fieldNames) {
      if (field in data) {
        setError(field, { type: "server", message: firstMessage(data[field]) ?? "Invalid value." });
        appliedFields.push(field);
      }
    }
  }

  if (appliedFields.length === 0 || data?.non_field_errors) {
    setError("root.serverError", {
      type: "server",
      message: firstMessage(data?.non_field_errors) ?? getErrorMessage(error),
    });
  }
  return appliedFields;
}
