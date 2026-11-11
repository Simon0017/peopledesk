import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { FormError } from "@/components/form/FormError";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/apiErrors";
import { useAuthStore } from "../authStore";
import { loginSchema } from "../schemas";
import { login } from "../session";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@peopledesk.test" },
  { label: "HR", email: "hr@peopledesk.test" },
  { label: "Employee", email: "employee@peopledesk.test" },
];
const DEMO_PASSWORD = "ChangeMe123!"; // from `python manage.py seed_demo`

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  useDocumentTitle("Sign in");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // State-driven redirect: once login stores a user, this component re-renders and
  // <Navigate> takes them where they were going (or to the dashboard).
  if (user) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}` : "/"} replace />;
  }

  // handleSubmit validates with Zod first and calls onSubmit only with valid, typed values.
  async function onSubmit(values) {
    try {
      await login(values);
    } catch (error) {
      setError("root.serverError", {
        message: error?.response?.status === 401 ? "Incorrect email or password." : getErrorMessage(error),
      });
    }
  }

  function fillDemoAccount(email) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Sign in to your account</h1>
      <p className="mt-1 text-sm text-fg-muted">Welcome back. Please enter your details.</p>

      {/* noValidate: let Zod, not the browser, show validation messages */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <FormError message={errors.root?.serverError?.message} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-xs text-fg-muted">Demo accounts (development only):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button key={account.email} variant="secondary" size="sm" onClick={() => fillDemoAccount(account.email)}>
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
