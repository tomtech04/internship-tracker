import { Skeleton } from "@/components/common/skeleton";

export default function Loading() {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-4"
      role="status"
      aria-label="Loading board"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-96 w-64 shrink-0" />
      ))}
    </div>
  );
}
