import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_PRIMARY, TOOLTIP_STYLE } from "../chartTheme";

// "Human Resources" → "Human", so the axis labels fit.
const shortLabel = (name) => name.split(" ")[0];

export function DepartmentChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="name" tickFormatter={shortLabel} tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "var(--color-surface-muted)" }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Employees" fill={CHART_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
