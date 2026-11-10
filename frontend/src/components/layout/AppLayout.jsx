import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { PageLoader } from "@/components/feedback/Loaders";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/uiStore";
import { OfflineBanner } from "./OfflineBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  // Global + persisted: the user's preference across sessions.
  const isSidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  // Local: whether the mobile drawer is open matters to nobody else and shouldn't persist.
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <OfflineBanner />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <ErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
