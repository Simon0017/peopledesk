import { Badge } from "@/components/ui/Badge";
import { LEAVE_STATUS_OPTIONS, labelFor } from "@/lib/constants";

const STATUS_TONES = { PENDING: "yellow", APPROVED: "green", REJECTED: "red", CANCELLED: "gray" };

export function LeaveStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? "gray"}>{labelFor(LEAVE_STATUS_OPTIONS, status)}</Badge>;
}
