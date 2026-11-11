import { memo } from "react";
import { Link } from "react-router";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";

/**
 * memo: skip re-rendering this row unless its props change (shallow comparison).
 * That only pays off if the parent passes STABLE props: the same employee object
 * from the cache and callbacks wrapped in useCallback.
 */
export const EmployeeRow = memo(function EmployeeRow({
  employee,
  canManage,
  canDelete,
  onStatusChange,
  onDelete,
  onPrefetch,
  cellClassName,
}) {
  const cell = cn("px-5 whitespace-nowrap", cellClassName);

  return (
    <tr className="hover:bg-surface-muted/60">
      <td className={cell}>
        <Link
          to={`/employees/${employee.id}`}
          onMouseEnter={() => onPrefetch?.(employee.id)}
          onFocus={() => onPrefetch?.(employee.id)}
          className="flex items-center gap-3"
        >
          <Avatar src={employee.avatar} name={employee.full_name} size="sm" />
          <span className="min-w-0">
            <span className="block font-medium text-fg hover:text-indigo-600">{employee.full_name}</span>
            <span className="block text-xs text-fg-muted">{employee.email}</span>
          </span>
        </Link>
      </td>
      <td className={cell}>{employee.job_title}</td>
      <td className={cell}>{employee.department_name ?? <span className="text-fg-muted">Unassigned</span>}</td>
      <td className={cell}>
        {canManage && onStatusChange ? (
          <select
            aria-label={`Status for ${employee.full_name}`}
            value={employee.status}
            onChange={(event) => onStatusChange(employee.id, event.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-sm"
          >
            {EMPLOYEE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <EmployeeStatusBadge status={employee.status} />
        )}
      </td>
      <td className={cell}>{formatDate(employee.hire_date)}</td>
      <td className={cn(cell, "text-right")}>
        <div className="flex justify-end gap-1">
          <Link to={`/employees/${employee.id}`} className={buttonClasses({ variant: "ghost", size: "icon-sm" })} aria-label={`View ${employee.full_name}`}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
          {canManage && (
            <Link to={`/employees/${employee.id}/edit`} className={buttonClasses({ variant: "ghost", size: "icon-sm" })} aria-label={`Edit ${employee.full_name}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          {canDelete && onDelete && (
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${employee.full_name}`} onClick={() => onDelete(employee)}>
              <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
});
