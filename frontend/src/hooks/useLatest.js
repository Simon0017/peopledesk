import { useLayoutEffect, useRef } from "react";

/**
 * Returns a ref whose .current is always the latest `value`.
 * Use it when an effect needs to CALL a callback prop without re-subscribing
 * every time the parent passes a new function (e.g. an inline arrow).
 * (React 19.2 adds `useEffectEvent` for the same problem.)
 */
export function useLatest(value) {
  const ref = useRef(value);
  // Update after render but before other effects run, so they see the latest value.
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
