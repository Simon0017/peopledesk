import { useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUiStore } from "@/stores/uiStore";

export function ThemeSync() {
  const theme = useUiStore((state) => state.theme);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isDark = theme === "dark" || (theme === "system" && prefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"; // native scrollbars/inputs
  }, [isDark]);

  return null;
}
