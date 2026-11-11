import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortableHeader({ label, field, ordering, onSort }) {
  const isActive = ordering === field || ordering === `-${field}`;
  const isDescending = ordering === `-${field}`;
  const Icon = !isActive ? ArrowUpDown : isDescending ? ArrowDown : ArrowUp;

  return (
    <th scope="col" aria-sort={isActive ? (isDescending ? "descending" : "ascending") : "none"} className="px-5 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(isActive && !isDescending ? `-${field}` : field)} // asc → desc → asc
        className="inline-flex items-center gap-1 font-medium hover:text-fg"
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}
