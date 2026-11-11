import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

/**
 * Works with React Hook Form's register(): <TextField label="Email" {...register("email")} />
 * register() returns { name, onChange, onBlur, ref }. In React 19, `ref` arrives as a normal prop.
 */
export function TextField({ label, hint, error, required, id: idFromProps, className, ref, ...inputProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={inputClasses(Boolean(error), "h-10")}
        {...inputProps}
      />
    </Field>
  );
}
