import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import { Button } from "./Button";

export function Pagination({ page, pageSize, count, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const firstItem = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, count);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-line px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-fg-muted">
        Showing <span className="font-medium text-fg">{firstItem}</span>–<span className="font-medium text-fg">{lastItem}</span> of{" "}
        <span className="font-medium text-fg">{count}</span>
      </p>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-fg-muted">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-line bg-surface px-2 text-fg"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="text-fg-muted">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
