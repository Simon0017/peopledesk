import { useId } from "react";

export function CheckboxField({ label, description, ref, ...inputProps }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} ref={ref} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line accent-indigo-600" {...inputProps} />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-fg-muted">{description}</span>}
      </label>
    </div>
  );
}
