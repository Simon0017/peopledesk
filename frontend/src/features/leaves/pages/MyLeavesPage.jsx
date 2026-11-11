import { useState } from "react";
import { CalendarDays, CalendarPlus, UserX } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useAuthStore } from "@/features/auth/authStore";
import { useDisclosure } from "@/hooks/useDisclosure";
import { getErrorMessage } from "@/lib/apiErrors";
import { LEAVE_STATUS, LEAVE_STATUS_OPTIONS } from "@/lib/constants";
import { LeaveRequestModal } from "../components/LeaveRequestModal";
import { LeaveSummary } from "../components/LeaveSummary";
import { LeaveTable } from "../components/LeaveTable";
import { useCancelLeave } from "../mutations";
import { useLeaves } from "../queries";

const PAGE_SIZE = 10;
const SUMMARY_PAGE_SIZE = 100; // enough history for this year's summary
const STATUS_TABS = [{ id: "ALL", label: "All" }, ...LEAVE_STATUS_OPTIONS.map((option) => ({ id: option.value, label: option.label }))];

export default function MyLeavesPage() {
  const employeeId = useAuthStore((state) => state.user?.employee_id);
  const [statusTab, setStatusTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [leaveToCancel, setLeaveToCancel] = useState(null);
  const requestModal = useDisclosure();
  const cancelLeave = useCancelLeave();
  const toast = useToast();

  const hasProfile = Boolean(employeeId);
  // Admin/HR receive everyone's requests from /leaves/, so always filter to "me".
  const listQuery = useLeaves(
    { employee: employeeId, status: statusTab === "ALL" ? "" : statusTab, page, page_size: PAGE_SIZE },
    { enabled: hasProfile },
  );
  const summaryQuery = useLeaves({ employee: employeeId, page: 1, page_size: SUMMARY_PAGE_SIZE }, { enabled: hasProfile });

  function handleTabChange(tabId) {
    setStatusTab(tabId);
    setPage(1); // a new filter starts at page 1. Both updates are batched into one render.
  }

  function handleConfirmCancel() {
    cancelLeave.mutate(leaveToCancel.id, {
      onSuccess: () => {
        toast.success("Leave request cancelled.");
        setLeaveToCancel(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  if (!hasProfile) {
    return (
      <>
        <PageHeader title="My leave" />
        <Card>
          <EmptyState icon={UserX} title="No employee profile" description="Your account isn't linked to an employee record, so you can't request leave." />
        </Card>
      </>
    );
  }

  let content;
  if (listQuery.isPending) {
    content = <TableSkeleton rows={4} columns={5} />;
  } else if (listQuery.isError) {
    content = <ErrorState message={getErrorMessage(listQuery.error)} onRetry={listQuery.refetch} />;
  } else if (listQuery.data.results.length === 0) {
    content = <EmptyState icon={CalendarDays} title="No leave requests here" description="Requests you make will appear in this list." />;
  } else {
    content = (
      <>
        <LeaveTable
          leaves={listQuery.data.results}
          renderActions={(leave) =>
            leave.status === LEAVE_STATUS.PENDING && (
              <Button variant="ghost" size="sm" onClick={() => setLeaveToCancel(leave)}>
                Cancel
              </Button>
            )
          }
        />
        <Pagination page={page} pageSize={PAGE_SIZE} count={listQuery.data.count} onPageChange={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My leave"
        description="Request time off and track your requests."
        actions={
          <Button leftIcon={CalendarPlus} onClick={requestModal.open}>
            Request leave
          </Button>
        }
      />
      {summaryQuery.data && <LeaveSummary leaves={summaryQuery.data.results} />}
      <Card>
        <div className="px-4">
          <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={handleTabChange} label="Filter by status" />
        </div>
        {content}
      </Card>

      <LeaveRequestModal isOpen={requestModal.isOpen} onClose={requestModal.close} onCreated={() => handleTabChange(LEAVE_STATUS.PENDING)} />
      <ConfirmDialog
        isOpen={Boolean(leaveToCancel)}
        onClose={() => setLeaveToCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={cancelLeave.isPending}
        title="Cancel this request?"
        message="HR will no longer see this request. You can submit a new one later."
        confirmLabel="Cancel request"
      />
    </>
  );
}
