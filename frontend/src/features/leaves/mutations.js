import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { leavesApi } from "./api";

function invalidateLeaveRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }); // pending count
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => leavesApi.create(data),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}

/** decision: "approve" | "reject" */
export function useReviewLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, review_note }) => leavesApi.review(id, decision, { review_note }),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => leavesApi.cancel(id),
    onSuccess: () => invalidateLeaveRelated(queryClient),
  });
}
