import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/features/employees/api";
import { queryKeys } from "@/lib/queryKeys";
import { departmentsApi } from "./api";

function invalidateDepartmentRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
}

export function useSaveDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    // One mutation for create and edit: the presence of `id` decides which.
    mutationFn: ({ id, data }) => (id ? departmentsApi.update(id, data) : departmentsApi.create(data)),
    onSuccess: () => {
      invalidateDepartmentRelated(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); // department names appear in employee rows
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => departmentsApi.remove(id),
    onSuccess: () => {
      invalidateDepartmentRelated(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); // members become "Unassigned"
    },
  });
}

/** Moves an employee into a department, or out of it with departmentId = null. */
export function useAssignDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, departmentId }) => employeesApi.update(employeeId, { department: departmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      invalidateDepartmentRelated(queryClient);
    },
  });
}
