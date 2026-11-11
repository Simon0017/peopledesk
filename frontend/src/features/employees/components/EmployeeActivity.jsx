import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useActivities } from "@/features/activity/queries";
import { getErrorMessage } from "@/lib/apiErrors";

export function EmployeeActivity({ employeeId }) {
  const { data, isPending, isError, error, refetch } = useActivities({
    target_type: "employee",
    target_id: employeeId,
    page_size: 20,
  });

  if (isPending) return <TableSkeleton rows={4} columns={2} />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  return <ActivityFeed items={data.results} />;
}
