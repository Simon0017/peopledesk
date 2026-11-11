import { EmployeeRow } from "./EmployeeRow";
import { SortableHeader } from "./SortableHeader";

const DENSITY_CLASSES = { comfortable: "py-3.5", compact: "py-2" };

export function EmployeeTable({ employees, ordering, onSort, density = "comfortable", ...rowProps }) {
  return (
    // overflow-x-auto: on phones the table scrolls sideways instead of breaking the layout
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            <SortableHeader label="Employee" field="last_name" ordering={ordering} onSort={onSort} />
            <SortableHeader label="Job title" field="job_title" ordering={ordering} onSort={onSort} />
            <th scope="col" className="px-5 py-3 text-left font-medium">
              Department
            </th>
            <SortableHeader label="Status" field="status" ordering={ordering} onSort={onSort} />
            <SortableHeader label="Hired" field="hire_date" ordering={ordering} onSort={onSort} />
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} cellClassName={DENSITY_CLASSES[density]} {...rowProps} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
