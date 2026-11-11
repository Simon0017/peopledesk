import { Card, CardHeader } from "@/components/ui/Card";

export function ChartCard({ title, description, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {/* Recharts' ResponsiveContainer needs a parent with an explicit height. */}
      <div className="h-72 p-4">{children}</div>
    </Card>
  );
}
