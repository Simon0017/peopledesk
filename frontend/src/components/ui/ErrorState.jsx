import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-red-50 p-3 dark:bg-red-500/10">
        <TriangleAlert className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-fg-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-5" leftIcon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
