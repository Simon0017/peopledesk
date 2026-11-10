import { useCallback, useMemo, useState } from "react";

export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Stable function identities: safe to pass to memoised children or effect deps.
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
}
