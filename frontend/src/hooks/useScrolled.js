// src/hooks/useScrolled.js
import { useEffect, useState } from "react";
import { throttle } from "@/lib/throttle";

const SCROLL_THROTTLE_MS = 100;

/** true once the window has scrolled past `threshold` px. Used for the top bar shadow. */
export function useScrolled(threshold = 4) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > threshold);

  useEffect(() => {
    // Scroll fires dozens of times per second; throttling keeps re-renders cheap.
    const handleScroll = throttle(() => setIsScrolled(window.scrollY > threshold), SCROLL_THROTTLE_MS);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [threshold]);

  return isScrolled;
}
