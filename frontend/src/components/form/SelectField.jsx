import { useFieldIds } from "@/hooks/useFieldIds";
import { Field } from "./Field";
import { inputClasses } from "./fieldStyles";

export function SelectField({ label, hint, error, required, options, placeholder, id: idFromProps, className, ref, ...selectProps }) {
  const { id, hintId, errorId, describedBy } = useFieldIds(idFromProps, { hint, error });

  return (
    <Field id={id} label={label} required={required} hint={hint} hintId={hintId} error={error} errorId={errorId} className={className}>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses(Boolean(error), "h-10 pr-8")}
        {...selectProps}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
