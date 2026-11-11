import { LEAVE_TYPE_OPTIONS, labelFor } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

export function LeaveTable({ leaves, showEmployee = false, renderActions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs tracking-wide text-fg-muted uppercase">
          <tr>
            {showEmployee && <th scope="col" className="px-5 py-3 font-medium">Employee</th>}
            <th scope="col" className="px-5 py-3 font-medium">Type</th>
            <th scope="col" className="px-5 py-3 font-medium">Dates</th>
            <th scope="col" className="px-5 py-3 font-medium">Days</th>
            <th scope="col" className="px-5 py-3 font-medium">Status</th>
            <th scope="col" className="px-5 py-3 font-medium">Reason / note</th>
            {renderActions && (
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {leaves.map((leave) => (
            <tr key={leave.id} className="align-top">
              {showEmployee && <td className="px-5 py-3.5 font-medium whitespace-nowrap">{leave.employee_name}</td>}
              <td className="px-5 py-3.5 whitespace-nowrap">{labelFor(LEAVE_TYPE_OPTIONS, leave.leave_type)}</td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
              </td>
              <td className="px-5 py-3.5">{leave.days}</td>
              <td className="px-5 py-3.5">
                <LeaveStatusBadge status={leave.status} />
              </td>
              <td className="max-w-xs px-5 py-3.5">
                <p className="line-clamp-2">{leave.reason}</p>
                {leave.review_note && (
                  <p className="mt-1 text-xs text-fg-muted">
                    {leave.reviewed_by_name ?? "Reviewer"}: {leave.review_note}
                  </p>
                )}
              </td>
              {renderActions && <td className="px-5 py-3.5 text-right whitespace-nowrap">{renderActions(leave)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
