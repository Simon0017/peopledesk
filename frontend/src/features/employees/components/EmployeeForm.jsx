import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Steps } from "@/components/ui/Steps";
import { useDepartments } from "@/features/departments/queries";
import { setFormErrors } from "@/lib/apiErrors";
import { EMPLOYEE_STATUS_OPTIONS } from "@/lib/constants";
import { EMPLOYEE_FIELD_NAMES, EMPLOYEE_FORM_STEPS, employeeSchema } from "../schemas";
import { AvatarUpload } from "./AvatarUpload";
import { EmergencyContactsField } from "./EmergencyContactsField";

/**
 * Used by BOTH the create and edit pages. The parent supplies `onSubmit(values)`,
 * which must return a promise. If it rejects, server errors are mapped onto fields.
 */
export function EmployeeForm({ defaultValues, onSubmit, onCancel, submitLabel, currentAvatarUrl }) {
  const [stepIndex, setStepIndex] = useState(0);
  const { data: departments } = useDepartments();
  const departmentOptions = useMemo(
    () => (departments ?? []).map((department) => ({ value: String(department.id), label: department.name })),
    [departments],
  );

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues, // read ONCE on mount (the edit page remounts the form with `key`)
    mode: "onTouched", // validate a field after it loses focus, then on every change
  });

  const isLastStep = stepIndex === EMPLOYEE_FORM_STEPS.length - 1;
  // getValues reads without subscribing. The names were typed on step 1, so reading
  // them when step 3 renders is enough. watch() here would re-render the whole form
  // on every keystroke.
  const fullName = `${getValues("first_name")} ${getValues("last_name")}`.trim(); // avatar initials

  async function goToNextStep() {
    // Validate only the current step's fields before moving on.
    const isStepValid = await trigger(EMPLOYEE_FORM_STEPS[stepIndex].fields, { shouldFocus: true });
    if (isStepValid) setStepIndex((index) => index + 1);
  }

  async function submit(values) {
    try {
      await onSubmit(values);
    } catch (error) {
      // e.g. {"email": ["employee with this email already exists."]} → error under the email field
      const failedFields = setFormErrors(error, setError, EMPLOYEE_FIELD_NAMES);
      // Jump to the first step that has a server error, so the user can see it.
      const stepWithError = EMPLOYEE_FORM_STEPS.findIndex((step) => step.fields.some((field) => failedFields.includes(field)));
      if (stepWithError !== -1) setStepIndex(stepWithError);
    }
  }

  // Pressing Enter (or "Continue") on an early step advances instead of submitting everything.
  function handleFormSubmit(event) {
    if (!isLastStep) {
      event.preventDefault();
      goToNextStep();
      return;
    }
    handleSubmit(submit)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <Steps steps={EMPLOYEE_FORM_STEPS} currentIndex={stepIndex} />

      <Card className="mt-6">
        <div className="space-y-5 p-6">
          <FormError message={errors.root?.serverError?.message} />

          {/* Only the current step is mounted. RHF keeps values of unmounted fields
              (shouldUnregister defaults to false), so going Back loses nothing. */}
          {stepIndex === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="First name" required autoComplete="given-name" error={errors.first_name?.message} {...register("first_name")} />
              <TextField label="Last name" required autoComplete="family-name" error={errors.last_name?.message} {...register("last_name")} />
              <TextField label="Work email" type="email" required error={errors.email?.message} {...register("email")} />
              <TextField label="Phone" type="tel" hint="Include the country code" error={errors.phone?.message} {...register("phone")} />
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Job title" required error={errors.job_title?.message} {...register("job_title")} />
              <SelectField
                label="Department"
                placeholder="No department"
                options={departmentOptions}
                error={errors.department?.message}
                {...register("department")}
              />
              <SelectField label="Status" required options={EMPLOYEE_STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />
              <TextField label="Hire date" type="date" required error={errors.hire_date?.message} {...register("hire_date")} />
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-8">
              {/* Controller adapts a CONTROLLED custom component (value/onChange) to RHF. */}
              <Controller
                control={control}
                name="avatar"
                render={({ field, fieldState }) => (
                  <AvatarUpload
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    currentUrl={currentAvatarUrl}
                    name={fullName}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <EmergencyContactsField control={control} register={register} errors={errors} />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 border-t border-line px-6 py-4">
          <Button variant="secondary" onClick={stepIndex === 0 ? onCancel : () => setStepIndex((index) => index - 1)}>
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button type="submit" isLoading={isLastStep && isSubmitting}>
            {isLastStep ? submitLabel : "Continue"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
