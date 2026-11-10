import { Building2, CalendarCheck, CalendarDays, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/leaves", label: "My leave", icon: CalendarDays, end: true },
  { to: "/leaves/approvals", label: "Leave approvals", icon: CalendarCheck },
  { to: "/users", label: "Users & roles", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Returns the navigation items for the current user. Phase 10 adds permission filtering. */
export function useNavItems() {
  return NAV_ITEMS;
}
