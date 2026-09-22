import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="That application, contact, or page doesn't exist."
      action={
        <Link
          href="/"
          className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to dashboard
        </Link>
      }
    />
  );
}
