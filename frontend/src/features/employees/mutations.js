import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { employeesApi } from "./api";

/** Employee changes affect department counts, dashboard stats and the activity feed too. */
function invalidateEmployeeRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => employeesApi.create(formData),
    onSuccess: (employee) => {
      // Seed the detail cache so the profile page renders instantly after redirect.
      queryClient.setQueryData(queryKeys.employees.detail(employee.id), employee);
      invalidateEmployeeRelated(queryClient);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => employeesApi.update(id, data),
    onSuccess: (employee) => {
      queryClient.setQueryData(queryKeys.employees.detail(employee.id), employee);
      invalidateEmployeeRelated(queryClient);
    },
  });
}

/**
 * OPTIMISTIC update: the status select changes instantly, before the server answers.
 * 1. onMutate  – cancel in-flight list fetches (they'd overwrite us), snapshot, write the new value
 * 2. onError   – restore the snapshot
 * 3. onSettled – refetch to make sure we match the server either way
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => employeesApi.update(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.all });

      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() });
      const previousDetail = queryClient.getQueryData(queryKeys.employees.detail(id));

      // Immutable update of every cached list page that contains this employee.
      queryClient.setQueriesData({ queryKey: queryKeys.employees.lists() }, (page) =>
        page
          ? { ...page, results: page.results.map((employee) => (employee.id === id ? { ...employee, status } : employee)) }
          : page,
      );
      if (previousDetail) {
        queryClient.setQueryData(queryKeys.employees.detail(id), { ...previousDetail, status });
      }

      return { previousLists, previousDetail }; // becomes `context` in onError
    },

    onError: (_error, { id }, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) queryClient.setQueryData(queryKeys.employees.detail(id), context.previousDetail);
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
      invalidateEmployeeRelated(queryClient);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => employeesApi.remove(id),
    // We deliberately DON'T invalidate or remove the deleted employee's detail query.
    // If the profile page is still mounted, that would trigger a refetch → 404 flash
    // before we navigate away. Once nothing uses it, it's garbage-collected.
    onSuccess: () => invalidateEmployeeRelated(queryClient),
  });
}
