import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/features/auth/authStore";
import { setFormErrors } from "@/lib/apiErrors";
import { ROLE_OPTIONS, ROLES } from "@/lib/constants";
import { useSaveUser } from "../mutations";
import { USER_FIELD_NAMES, makeUserSchema } from "../schemas";

/** `user` = the account to edit, or null to create one. */
export function UserFormModal({ isOpen, onClose, user }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit user" : "New user"} size="lg">
      <UserForm user={user} onDone={onClose} />
    </Modal>
  );
}

function UserForm({ user, onDone }) {
  const isEdit = Boolean(user);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isSelf = isEdit && user.id === currentUserId;
  const saveUser = useSaveUser();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(makeUserSchema({ isEdit })),
    defaultValues: {
      email: user?.email ?? "",
      username: user?.username ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      role: user?.role ?? ROLES.EMPLOYEE,
      phone: user?.phone ?? "",
      is_active: user?.is_active ?? true,
      password: "",
    },
  });

  async function onSubmit(values) {
    // Editing with an empty password means "keep the current one": don't send the field at all.
    const { password, ...rest } = values;
    const data = password ? values : rest;
    try {
      const saved = await saveUser.mutateAsync({ id: user?.id, data });
      toast.success(isEdit ? `${saved.full_name} was updated.` : `${saved.full_name} can now sign in.`);
      onDone();
    } catch (error) {
      setFormErrors(error, setError, USER_FIELD_NAMES);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" required error={errors.first_name?.message} {...register("first_name")} />
        <TextField label="Last name" required error={errors.last_name?.message} {...register("last_name")} />
        <TextField label="Email" type="email" required error={errors.email?.message} {...register("email")} />
        <TextField label="Username" required error={errors.username?.message} {...register("username")} />
        {isSelf ? (
          // Not registered: RHF still submits the default value (the current role) unchanged.
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Role</p>
            <p className="text-sm text-fg-muted">You can't change your own role.</p>
          </div>
        ) : (
          <SelectField label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register("role")} />
        )}
        <TextField label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
        <TextField
          label={isEdit ? "New password" : "Password"}
          type="password"
          autoComplete="new-password"
          required={!isEdit}
          hint={isEdit ? "Leave blank to keep the current password." : "At least 8 characters."}
          error={errors.password?.message}
          {...register("password")}
          className="sm:col-span-2"
        />
      </div>
      {!isSelf && <CheckboxField label="Active" description="Inactive users can't sign in." {...register("is_active")} />}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
