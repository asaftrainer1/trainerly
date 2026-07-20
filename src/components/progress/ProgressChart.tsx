import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { ProgressEntry } from "@/types/database";

type Metric = "weight_kg" | "body_fat_pct" | "waist_cm" | "chest_cm";

const metricLabels: Record<Metric, { label: string; unit: string }> = {
  weight_kg: { label: "Weight", unit: "kg" },
  body_fat_pct: { label: "Body fat", unit: "%" },
  waist_cm: { label: "Waist", unit: "cm" },
  chest_cm: { label: "Chest", unit: "cm" },
};

export function ProgressChart({ entries }: { entries: ProgressEntry[] }) {
  const [metric, setMetric] = React.useState<Metric>("weight_kg");

  const data = React.useMemo(
    () =>
      entries
        .filter((e) => e[metric] != null)
        .map((e) => ({
          date: formatDate(e.date, { month: "short", day: "numeric" }),
          value: Number(e[metric]),
        })),
    [entries, metric]
  );

  const { label, unit } = metricLabels[metric];
  const latest = data.at(-1)?.value;
  const first = data[0]?.value;
  const delta = latest != null && first != null ? latest - first : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{label} trend</CardTitle>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {latest != null ? `${latest} ${unit}` : "—"}
            </span>
            {delta != null && (
              <span
                className={
                  delta < 0 ? "text-sm font-medium text-success" : "text-sm font-medium text-warning"
                }
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)} {unit}
              </span>
            )}
          </div>
        </div>
        <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricLabels).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No {label.toLowerCase()} data recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 14% 16%)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(220 9% 60%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(220 9% 60%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(228 18% 9%)",
                  border: "1px solid hsl(228 14% 16%)",
                  borderRadius: "0.75rem",
                  fontSize: "0.8125rem",
                }}
                labelStyle={{ color: "hsl(220 9% 60%)" }}
                formatter={(value: number) => [`${value} ${unit}`, label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(239 84% 67%)"
                strokeWidth={2.5}
                fill="url(#chartFill)"
                dot={{ r: 3, fill: "hsl(239 84% 67%)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
