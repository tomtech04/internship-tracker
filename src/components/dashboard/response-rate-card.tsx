export function ResponseRateCard({ rate }: { rate: number }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Response rate</h3>
      <div>
        <p className="text-4xl font-bold tabular-nums text-primary">
          {rate.toFixed(0)}%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          of applied roles moved past the initial application stage
        </p>
      </div>
    </div>
  );
}
