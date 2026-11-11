import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { setFormErrors } from "@/lib/apiErrors";
import { useChangePassword } from "../mutations";
import { passwordSchema } from "../schemas";

const EMPTY_PASSWORDS = { current_password: "", new_password: "", confirm_password: "" };

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY_PASSWORDS });

  async function onSubmit({ current_password, new_password }) {
    try {
      // confirm_password is a client-only field: the API never sees it.
      await changePassword.mutateAsync({ current_password, new_password });
      reset(EMPTY_PASSWORDS);
      toast.success("Your password was changed.");
    } catch (error) {
      // e.g. {"current_password": ["Your current password is incorrect."]}
      setFormErrors(error, setError, ["current_password", "new_password"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md space-y-4 p-6">
      <FormError message={errors.root?.serverError?.message} />
      <TextField label="Current password" type="password" autoComplete="current-password" required error={errors.current_password?.message} {...register("current_password")} />
      <TextField label="New password" type="password" autoComplete="new-password" required error={errors.new_password?.message} {...register("new_password")} />
      <TextField label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirm_password?.message} {...register("confirm_password")} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Change password
        </Button>
      </div>
    </form>
  );
}
