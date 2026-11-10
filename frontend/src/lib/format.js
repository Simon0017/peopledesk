const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses API dates safely. `new Date("2026-03-01")` is treated as UTC midnight,
 * which shows as Feb 28 for users west of UTC. Date-only strings are therefore
 * parsed as LOCAL dates.
 */
export function parseDate(value) {
  if (!value) return null;
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });

export function formatDate(value) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "—";
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const RELATIVE_UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 hours ago", "yesterday", "in 2 days". */
export function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
}

/** Today as YYYY-MM-DD in the user's local time zone (what <input type="date"> uses). */
export function toISODate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inclusive number of days between two YYYY-MM-DD strings, or 0 if invalid. */
export function countDays(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate || endDate < startDate) return 0;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((endDate - startDate) / MS_PER_DAY) + 1;
}

/** "Amara Okafor" -> "AO" */
export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
