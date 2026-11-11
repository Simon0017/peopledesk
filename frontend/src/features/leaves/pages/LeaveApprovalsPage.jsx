import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useAuthStore } from "@/features/auth/authStore";
import { getErrorMessage } from "@/lib/apiErrors";
import { LEAVE_STATUS, LEAVE_STATUS_OPTIONS } from "@/lib/constants";
import { LeaveTable } from "../components/LeaveTable";
import { ReviewLeaveModal } from "../components/ReviewLeaveModal";
import { useLeaves } from "../queries";

const PAGE_SIZE = 10;
const STATUS_TABS = [...LEAVE_STATUS_OPTIONS.map((option) => ({ id: option.value, label: option.label })), { id: "ALL", label: "All history" }];

export default function LeaveApprovalsPage() {
  const myEmployeeId = useAuthStore((state) => state.user?.employee_id);
  const [statusTab, setStatusTab] = useState(LEAVE_STATUS.PENDING); // the queue is what matters most
  const [page, setPage] = useState(1);
  const [review, setReview] = useState(null);

  const { data, isPending, isError, error, refetch } = useLeaves({
    status: statusTab === "ALL" ? "" : statusTab,
    page,
    page_size: PAGE_SIZE,
    ordering: statusTab === LEAVE_STATUS.PENDING ? "start_date" : "-created_at", // soonest first in the queue
  });

  function handleTabChange(tabId) {
    setStatusTab(tabId);
    setPage(1);
  }

  function renderActions(leave) {
    if (leave.status !== LEAVE_STATUS.PENDING) return null;
    // Mirrors the API rule: you can't review your own request.
    const isOwnRequest = leave.employee === myEmployeeId;
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" leftIcon={X} disabled={isOwnRequest} onClick={() => setReview({ leave, decision: "reject" })}>
          Reject
        </Button>
        <Button
          size="sm"
          leftIcon={Check}
          disabled={isOwnRequest}
          title={isOwnRequest ? "You can't review your own request" : undefined}
          onClick={() => setReview({ leave, decision: "approve" })}
        >
          Approve
        </Button>
      </div>
    );
  }

  let content;
  if (isPending) {
    content = <TableSkeleton rows={5} columns={6} />;
  } else if (isError) {
    content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (data.results.length === 0) {
    content = (
      <EmptyState
        icon={Inbox}
        title={statusTab === LEAVE_STATUS.PENDING ? "All caught up" : "Nothing here"}
        description={statusTab === LEAVE_STATUS.PENDING ? "There are no requests waiting for review." : undefined}
      />
    );
  } else {
    content = (
      <>
        <LeaveTable leaves={data.results} showEmployee renderActions={renderActions} />
        <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Leave approvals" description="Review requests and browse the leave history." />
      <Card>
        <div className="px-4">
          <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={handleTabChange} label="Filter by status" />
        </div>
        {content}
      </Card>
      <ReviewLeaveModal review={review} onClose={() => setReview(null)} />
    </>
  );
}
