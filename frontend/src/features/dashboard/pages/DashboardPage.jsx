import { useMemo } from "react";
import { Link } from "react-router";
import { Building2, CalendarClock, UserCheck, UserMinus, Users, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { useAuthStore } from "@/features/auth/authStore";
import { usePermission } from "@/features/auth/usePermission";
import { getErrorMessage } from "@/lib/apiErrors";
import { EMPLOYEE_STATUS_OPTIONS, labelFor } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { ChartCard } from "../components/ChartCard";
import { DepartmentChart } from "../components/DepartmentChart";
import { HiresChart } from "../components/HiresChart";
import { StatCard } from "../components/StatCard";
import { StatusChart } from "../components/StatusChart";
import { useDashboardStats } from "../queries";

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "short" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const firstName = useAuthStore((state) => state.user?.first_name);
  const canViewActivity = usePermission("activity.view");
  const canReviewLeave = usePermission("leaves.review");
  const { data: stats, isPending, isError, error, refetch, dataUpdatedAt } = useDashboardStats();

  // Derived chart data. useMemo keeps the SAME array while `stats` is unchanged (and thanks
  // to structural sharing, polling doesn't change it), so charts don't redraw needlessly.
  const statusData = useMemo(
    () => (stats?.by_status ?? []).map((row) => ({ ...row, label: labelFor(EMPLOYEE_STATUS_OPTIONS, row.status) })),
    [stats?.by_status],
  );
  const hiresData = useMemo(
    () =>
      (stats?.hires_by_month ?? []).map((row) => {
        const [year, month] = row.month.split("-").map(Number);
        return { ...row, label: monthFormatter.format(new Date(year, month - 1, 1)) };
      }),
    [stats?.hires_by_month],
  );

  const header = (
    <PageHeader
      title="Dashboard"
      description={`${greeting()}${firstName ? `, ${firstName}` : ""}. Here's what's happening at your company.`}
      actions={dataUpdatedAt > 0 && <span className="text-xs text-fg-muted">Updated {formatRelative(new Date(dataUpdatedAt).toISOString())}</span>}
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <Card>
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total employees" value={stats.total_employees} icon={Users} to="/employees" />
        <StatCard label="Active" value={stats.active_employees} icon={UserCheck} tone="green" to="/employees?status=ACTIVE" />
        <StatCard label="Inactive" value={stats.inactive_employees} icon={UserX} tone="gray" to="/employees?status=INACTIVE" />
        <StatCard label="On leave" value={stats.on_leave_employees} icon={UserMinus} tone="yellow" to="/employees?status=ON_LEAVE" />
        <StatCard label="Departments" value={stats.total_departments} icon={Building2} to="/departments" />
        <StatCard
          label="Pending leave requests"
          value={stats.pending_leaves}
          icon={CalendarClock}
          tone="red"
          to={canReviewLeave ? "/leaves/approvals" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Employees by department">
          <DepartmentChart data={stats.by_department} />
        </ChartCard>
        <ChartCard title="Employment status">
          <StatusChart data={statusData} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className={canViewActivity ? "lg:col-span-2" : "lg:col-span-3"}>
          <ChartCard title="New hires" description="Last 12 months">
            <HiresChart data={hiresData} />
          </ChartCard>
        </div>
        {canViewActivity && (
          <Card>
            <CardHeader
              title="Recent activity"
              actions={
                <Link to="/employees" className="text-sm text-indigo-600 hover:underline">
                  Directory
                </Link>
              }
            />
            <ActivityFeed items={stats.recent_activity} />
          </Card>
        )}
      </div>
    </>
  );
}
