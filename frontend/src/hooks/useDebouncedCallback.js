import { useCallback, useEffect, useRef } from "react";
import { useLatest } from "./useLatest";

export function useDebouncedCallback(callback, delay = 400) {
  const callbackRef = useLatest(callback);
  const timeoutRef = useRef(null); // a timer id: mutable, never rendered → a ref, not state

  // Cancel a pending call if the component unmounts.
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay, callbackRef],
  );
}
