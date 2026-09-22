import { StatusBadge } from "@/components/common/badges";
import type { Status } from "@/lib/constants";

export function StatusCountsGrid({
  counts,
}: {
  counts: { status: Status; count: number }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Applications by status
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {counts.map(({ status, count }) => (
          <div
            key={status}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2"
          >
            <StatusBadge status={status} />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
