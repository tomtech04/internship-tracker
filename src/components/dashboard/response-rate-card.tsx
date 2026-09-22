export function ResponseRateCard({ rate }: { rate: number }) {
  return (
    <div className="border-border bg-card flex flex-col justify-between rounded-lg border p-4">
      <h3 className="text-foreground text-sm font-semibold">Response rate</h3>
      <div>
        <p className="text-primary text-4xl font-bold tabular-nums">
          {rate.toFixed(0)}%
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          of applied roles moved past the initial application stage
        </p>
      </div>
    </div>
  );
}
