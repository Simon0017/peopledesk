/**
 * Joins class names, skipping falsy values, so you can write:
 *   cn("px-4", isActive && "bg-indigo-600", className)
 * `.flat()` also lets callers pass arrays of classes.
 */
export function cn(...classes) {
  return classes.flat().filter(Boolean).join(" ");
}
