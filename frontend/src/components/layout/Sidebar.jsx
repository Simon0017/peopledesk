import { NavLink } from "react-router";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useNavItems } from "@/app/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const items = useNavItems();

  return (
    <>
      {/* Mobile backdrop: only rendered while the drawer is open */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" aria-hidden="true" onClick={onMobileClose} />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-[width,translate] duration-200",
          // Mobile: slide in/out. Desktop: always visible, width depends on collapsed state.
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed && "lg:w-20",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo hideTextOnDesktop={isCollapsed} />
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Close navigation" onClick={onMobileClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end} // without `end`, "/" would be "active" on every page
              onClick={onMobileClose} // close the drawer from the event, not with an effect
              title={isCollapsed ? label : undefined}
              // NavLink accepts a function for className and passes { isActive }.
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                  isCollapsed && "lg:justify-center",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn(isCollapsed && "lg:sr-only")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-line p-3 lg:block">
          <Button
            variant="ghost"
            className={cn("w-full", isCollapsed ? "justify-center" : "justify-start")}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
