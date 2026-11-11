import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

export function TextAreaField({ label, hint, error, required, rows = 4, id: idFromProps, className, ref, ...textareaProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses(Boolean(error), "py-2")}
        {...textareaProps}
      />
    </Field>
  );
}
