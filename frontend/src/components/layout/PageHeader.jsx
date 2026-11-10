import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function PageHeader({ title, description, actions, backTo, backLabel = "Back" }) {
  useDocumentTitle(title); // every page with a header gets a matching browser tab title

  return (
    <div className="mb-6">
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
