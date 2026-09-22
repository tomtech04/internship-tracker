import { Skeleton } from "@/components/common/skeleton";

export default function Loading() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label="Loading table"
    >
      <Skeleton className="h-9 w-full max-w-2xl" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
