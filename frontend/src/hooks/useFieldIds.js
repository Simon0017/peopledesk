import { useId } from "react";

/** Ids that tie a label, input, hint and error message together for screen readers. */
export function useFieldIds(idFromProps, { hint, error } = {}) {
  const generatedId = useId();
  const id = idFromProps ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // The error replaces the hint visually, so describe the input with whichever is shown.
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return { id, hintId, errorId, describedBy };
}
