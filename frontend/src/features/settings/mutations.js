import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/authStore";
import { queryKeys } from "@/lib/queryKeys";

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (user) => {
      setUser(user); // the top bar name updates immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (data) => authApi.changePassword(data) });
}
