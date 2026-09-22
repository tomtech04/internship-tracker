import { Skeleton } from "@/components/common/skeleton";

export default function Loading() {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading companies"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  );
}
