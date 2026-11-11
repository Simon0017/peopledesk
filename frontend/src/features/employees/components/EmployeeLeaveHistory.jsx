import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { LeaveTable } from "@/features/leaves/components/LeaveTable";
import { useLeaves } from "@/features/leaves/queries";
import { getErrorMessage } from "@/lib/apiErrors";

const HISTORY_PAGE_SIZE = 20;

export function EmployeeLeaveHistory({ employeeId }) {
  const { data, isPending, isError, error, refetch } = useLeaves({ employee: employeeId, page: 1, page_size: HISTORY_PAGE_SIZE });

  if (isPending) return <TableSkeleton rows={3} columns={5} />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  if (data.results.length === 0) return <EmptyState icon={CalendarDays} title="No leave requests" />;
  return <LeaveTable leaves={data.results} />;
}
