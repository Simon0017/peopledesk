import { Check, Minus } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PERMISSIONS } from "@/features/auth/permissions";
import { ROLE_OPTIONS } from "@/lib/constants";

const PERMISSION_LABELS = {
  "employees.manage": "Create and edit employees",
  "employees.delete": "Delete employees",
  "employees.viewHistory": "View employee leave and activity history",
  "departments.manage": "Manage departments",
  "leaves.review": "Approve or reject leave",
  "activity.view": "View the activity feed",
  "users.manage": "Manage user accounts and roles",
  "leaves.request": "Request leave",
};

/** Rendered straight from the PERMISSIONS map: the docs can never drift from the code. */
export function PermissionMatrix() {
  return (
    <Card>
      <CardHeader title="Role permissions" description="What each role can do in PeopleDesk." />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-muted/50 text-xs tracking-wide text-fg-muted uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 text-left font-medium">Permission</th>
              {ROLE_OPTIONS.map((role) => (
                <th key={role.value} scope="col" className="px-5 py-3 text-center font-medium">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {Object.entries(PERMISSIONS).map(([permission, roles]) => (
              <tr key={permission}>
                <td className="px-5 py-3">{PERMISSION_LABELS[permission] ?? permission}</td>
                {ROLE_OPTIONS.map((role) => (
                  <td key={role.value} className="px-5 py-3 text-center">
                    {roles.includes(role.value) ? (
                      <Check className="mx-auto h-4 w-4 text-green-600" aria-label="Allowed" />
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-fg-muted" aria-label="Not allowed" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
