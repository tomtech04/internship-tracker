import { Skeleton } from "@/components/common/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
