"use client";

import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STAGE_COLORS: Record<string, string> = {
  Applied: "#4f46e5",
  Screen: "#6366f1",
  Interview: "#8b5cf6",
  Offer: "#22c55e",
};

export function FunnelChartCard({
  data,
}: {
  data: { stage: string; count: number }[];
}) {
  const chartData = data.map((d) => ({
    name: d.stage,
    value: d.count,
    fill: STAGE_COLORS[d.stage] ?? "#4f46e5",
  }));

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-2 text-sm font-semibold">
        Pipeline funnel
      </h3>
      <p className="text-muted-foreground mb-3 text-xs">
        Applications that ever reached each stage, including ones later
        rejected.
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={chartData} isAnimationActive>
              <LabelList
                position="right"
                dataKey="name"
                fill="var(--color-foreground)"
                stroke="none"
              />
              <LabelList
                position="left"
                dataKey="value"
                fill="var(--color-card-foreground)"
                stroke="none"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
