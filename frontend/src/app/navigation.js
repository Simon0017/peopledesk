import { Building2, CalendarCheck, CalendarDays, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import { useCan } from "@/features/auth/usePermission";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/leaves", label: "My leave", icon: CalendarDays, end: true },
  { to: "/leaves/approvals", label: "Leave approvals", icon: CalendarCheck, permission: "leaves.review" },
  { to: "/users", label: "Users & roles", icon: ShieldCheck, permission: "users.manage" },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Navigation items the current user is allowed to see. */
export function useNavItems() {
  const can = useCan();
  return NAV_ITEMS.filter((item) => !item.permission || can(item.permission));
}
