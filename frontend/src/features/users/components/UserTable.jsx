import { memo } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { RoleBadge } from "./RoleBadge";

/**
 * memo matters here: while the deferred search catches up, the parent re-renders
 * with the OLD filtered list. memo lets that render skip the table entirely,
 * which is what keeps typing fast.
 */
export const UserTable = memo(function UserTable({ users, currentUserId, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">User</th>
            <th scope="col" className="px-5 py-3 font-medium">Role</th>
            <th scope="col" className="px-5 py-3 font-medium">Status</th>
            <th scope="col" className="px-5 py-3 font-medium">Joined</th>
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium">
                        {user.full_name}
                        {isSelf && <span className="ml-2 text-xs text-fg-muted">(you)</span>}
                      </p>
                      <p className="text-xs text-fg-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3">{user.is_active ? <Badge tone="green">Active</Badge> : <Badge>Deactivated</Badge>}</td>
                <td className="px-5 py-3 whitespace-nowrap">{formatDate(user.date_joined)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${user.full_name}`} onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isSelf}
                      aria-label={user.is_active ? `Deactivate ${user.full_name}` : `Activate ${user.full_name}`}
                      onClick={() => onToggleActive(user)}
                    >
                      <Power className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" disabled={isSelf} aria-label={`Delete ${user.full_name}`} onClick={() => onDelete(user)}>
                      <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
