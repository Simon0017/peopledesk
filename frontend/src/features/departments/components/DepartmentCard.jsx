import { Link } from "react-router";
import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DepartmentCard({ department, canManage, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/departments/${department.id}`} className="font-semibold hover:text-indigo-600">
            {department.name}
          </Link>
          <p className="text-xs font-medium tracking-wide text-fg-muted uppercase">{department.code}</p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${department.name}`} onClick={() => onEdit(department)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${department.name}`} onClick={() => onDelete(department)}>
              <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm text-fg-muted">{department.description || "No description."}</p>
      <p className="mt-4 flex items-center gap-1.5 text-sm">
        <Users className="h-4 w-4 text-fg-muted" aria-hidden="true" />
        {department.employee_count} {department.employee_count === 1 ? "employee" : "employees"}
      </p>
    </Card>
  );
}
