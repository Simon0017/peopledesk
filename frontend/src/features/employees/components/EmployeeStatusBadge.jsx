import { Badge } from "@/components/ui/Badge";
import { EMPLOYEE_STATUS_OPTIONS, labelFor } from "@/lib/constants";

const STATUS_TONES = { ACTIVE: "green", INACTIVE: "gray", ON_LEAVE: "yellow" };

export function EmployeeStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? "gray"}>{labelFor(EMPLOYEE_STATUS_OPTIONS, status)}</Badge>;
}
