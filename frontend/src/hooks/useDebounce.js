import { useEffect, useState } from "react";

/** Returns `value` only after it has stopped changing for `delay` ms. */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    // Each new keystroke cancels the previous timer. That cleanup IS the debounce.
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
