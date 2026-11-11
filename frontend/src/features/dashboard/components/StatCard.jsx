import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  yellow: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

/** A KPI tile. With `to`, the whole card links to a pre-filtered view. */
export function StatCard({ label, value, icon: Icon, tone = "indigo", to }) {
  const body = (
    <Card className={cn("flex items-center gap-4 p-5", to && "transition-shadow hover:shadow-md")}>
      <span className={cn("rounded-lg p-3", TONES[tone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-fg-muted">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-600">
      {body}
    </Link>
  ) : (
    body
  );
}
