import { useEffect } from "react";
import { useLatest } from "./useLatest";

/** Calls `onOutside` when a pointer press happens outside `ref`'s element. */
export function useClickOutside(ref, onOutside, enabled = true) {
  const handlerRef = useLatest(onOutside);

  useEffect(() => {
    if (!enabled) return undefined;
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current(event);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, enabled, handlerRef]);
}
