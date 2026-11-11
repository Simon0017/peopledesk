import { Badge } from "@/components/ui/Badge";
import { ROLE_OPTIONS, labelFor } from "@/lib/constants";

const ROLE_TONES = { ADMIN: "indigo", HR: "blue", EMPLOYEE: "gray" };

export function RoleBadge({ role }) {
  return <Badge tone={ROLE_TONES[role]}>{labelFor(ROLE_OPTIONS, role)}</Badge>;
}
