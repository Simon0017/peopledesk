import { createContext } from "react";

/** Holds the toast API ({ success, error, info, dismiss }), not the list of toasts. */
export const ToastContext = createContext(null);
