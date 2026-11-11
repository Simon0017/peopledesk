import { Card } from "@/components/ui/Card";

/** Derives totals from the user's requests. No extra state, no extra endpoint. */
export function LeaveSummary({ leaves }) {
  const currentYear = String(new Date().getFullYear());

  const summary = leaves.reduce(
    (totals, leave) => {
      totals[leave.status] = (totals[leave.status] ?? 0) + 1;
      if (leave.status === "APPROVED" && leave.start_date.startsWith(currentYear)) {
        totals.approvedDaysThisYear += leave.days;
      }
      return totals; // mutating the accumulator is fine: it's a local object created by reduce
    },
    { approvedDaysThisYear: 0 },
  );

  const cards = [
    { label: "Pending", value: summary.PENDING ?? 0 },
    { label: "Approved", value: summary.APPROVED ?? 0 },
    { label: "Rejected", value: summary.REJECTED ?? 0 },
    { label: `Days taken in ${currentYear}`, value: summary.approvedDaysThisYear },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <p className="text-sm text-fg-muted">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
