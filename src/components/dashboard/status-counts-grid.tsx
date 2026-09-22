import { StatusBadge } from "@/components/common/badges";
import type { Status } from "@/lib/constants";

export function StatusCountsGrid({
  counts,
}: {
  counts: { status: Status; count: number }[];
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        Applications by status
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {counts.map(({ status, count }) => (
          <div
            key={status}
            className="border-border flex items-center justify-between gap-2 rounded-md border px-2.5 py-2"
          >
            <StatusBadge status={status} />
            <span className="text-foreground text-sm font-semibold tabular-nums">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
