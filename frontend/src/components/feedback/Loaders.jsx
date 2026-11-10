import { Spinner } from "@/components/ui/Spinner";

/** Shown inside the layout while a lazy page chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <Spinner className="h-6 w-6 text-indigo-600" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

/** Covers the whole screen, e.g. while the session is restored on startup. */
export function FullPageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas" role="status">
      <Spinner className="h-8 w-8 text-indigo-600" />
      <p className="text-sm text-fg-muted">{label}</p>
    </div>
  );
}
