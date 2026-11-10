import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  // getSnapshot is read on every render; getServerSnapshot is a fallback for non-browser rendering.
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
