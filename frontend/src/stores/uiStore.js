import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const UI_STORAGE_KEY = "peopledesk-ui";

/**
 * Global UI preferences. `persist` saves them to localStorage under
 * UI_STORAGE_KEY and restores them on load.
 */
export const useUiStore = create(
  persist(
    (set) => ({
      theme: "system", // "light" | "dark" | "system"
      sidebarCollapsed: false,
      pageSize: DEFAULT_PAGE_SIZE,
      density: "comfortable", // "comfortable" | "compact"

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setPageSize: (pageSize) => set({ pageSize }),
      setDensity: (density) => set({ density }),
    }),
    { name: UI_STORAGE_KEY, version: 1 },
  ),
);
