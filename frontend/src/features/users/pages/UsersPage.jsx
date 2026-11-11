import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useToast } from "@/components/feedback/useToast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/features/auth/authStore";
import { getErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/cn";
import { ROLE_OPTIONS } from "@/lib/constants";
import { PermissionMatrix } from "../components/PermissionMatrix";
import { UserFormModal } from "../components/UserFormModal";
import { UserTable } from "../components/UserTable";
import { useDeleteUser, useSaveUser } from "../mutations";
import { useUsers } from "../queries";

export default function UsersPage() {
  const { data: users, isPending, isError, error, refetch } = useUsers();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { mutate: saveUser } = useSaveUser();
  const deleteUser = useDeleteUser();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formState, setFormState] = useState(null); // null | { user: null | User }
  const [userToDelete, setUserToDelete] = useState(null);

  // The input always shows `search` (urgent). The list filters by `deferredSearch`,
  // which catches up in a background render that the next keystroke can interrupt.
  const deferredSearch = useDeferredValue(search);
  const isStale = search !== deferredSearch;

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return (users ?? []).filter(
      (user) =>
        (!roleFilter || user.role === roleFilter) &&
        (!query || user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)),
    );
  }, [users, deferredSearch, roleFilter]);

  // Stable callbacks, so the memoised UserTable can skip renders.
  const handleEdit = useCallback((user) => setFormState({ user }), []);
  const handleToggleActive = useCallback(
    (user) =>
      saveUser(
        { id: user.id, data: { is_active: !user.is_active } },
        {
          onSuccess: (saved) => toast.success(`${saved.full_name} was ${saved.is_active ? "activated" : "deactivated"}.`),
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      ),
    [saveUser, toast],
  );

  function handleConfirmDelete() {
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`${userToDelete.full_name}'s account was deleted.`);
        setUserToDelete(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  let content;
  if (isPending) content = <TableSkeleton rows={6} columns={5} />;
  else if (isError) content = <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  else if (filteredUsers.length === 0) content = <EmptyState icon={ShieldCheck} title="No users match" />;
  else
    content = (
      <div className={cn("transition-opacity", isStale && "opacity-60")}>
        <UserTable
          users={filteredUsers}
          currentUserId={currentUserId}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={setUserToDelete}
        />
      </div>
    );

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Control who can sign in and what they can do."
        actions={
          <Button leftIcon={UserPlus} onClick={() => setFormState({ user: null })}>
            New user
          </Button>
        }
      />
      <Card className="mb-6">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" label="Search users" className="sm:max-w-sm sm:flex-1" />
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-lg border border-line bg-surface px-3 text-sm shadow-sm"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        {content}
      </Card>

      <PermissionMatrix />

      <UserFormModal isOpen={formState !== null} onClose={() => setFormState(null)} user={formState?.user ?? null} />
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteUser.isPending}
        title="Delete user account?"
        message={`${userToDelete?.full_name ?? "This user"} will no longer be able to sign in. Their employee record (if any) is kept.`}
        confirmLabel="Delete account"
      />
    </>
  );
}
