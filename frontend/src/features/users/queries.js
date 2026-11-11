import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { usersApi } from "./api";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: ({ signal }) => usersApi.list({ signal }),
  });
}
