import { useNavigate } from "react-router";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/features/auth/authStore";
import { logout } from "@/features/auth/session";
import { ROLE_OPTIONS, labelFor } from "@/lib/constants";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <Dropdown
      label="Account menu"
      triggerSize="md"
      triggerContent={
        <>
          <Avatar name={user.full_name} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-fg">{user.full_name}</span>
          </span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{user.full_name}</p>
        <p className="truncate text-xs text-fg-muted">{user.email}</p>
        <Badge tone="indigo" className="mt-2">
          {labelFor(ROLE_OPTIONS, user.role)}
        </Badge>
      </div>
      <div className="my-1 border-t border-line" />
      <DropdownItem icon={Settings} onSelect={() => navigate("/settings")}>
        Profile & settings
      </DropdownItem>
      <DropdownItem icon={LogOut} tone="danger" onSelect={logout}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
