import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/feedback/useToast";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/authStore";
import { setFormErrors } from "@/lib/apiErrors";
import { useUpdateProfile } from "../mutations";
import { profileSchema } from "../schemas";

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user.first_name, last_name: user.last_name, phone: user.phone ?? "" },
  });

  async function onSubmit(values) {
    try {
      const saved = await updateProfile.mutateAsync(values);
      // Make the saved values the new baseline, so isDirty goes back to false.
      reset({ first_name: saved.first_name, last_name: saved.last_name, phone: saved.phone ?? "" });
      toast.success("Your profile was updated.");
    } catch (error) {
      setFormErrors(error, setError, ["first_name", "last_name", "phone"]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-5 p-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.full_name} size="lg" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-fg-muted">{user.email}</p>
        </div>
      </div>
      <FormError message={errors.root?.serverError?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" required error={errors.first_name?.message} {...register("first_name")} />
        <TextField label="Last name" required error={errors.last_name?.message} {...register("last_name")} />
      </div>
      <TextField label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
      <TextField label="Email" value={user.email} readOnly disabled hint="Contact an administrator to change your email." />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
