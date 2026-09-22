"use client";

import { differenceInCalendarDays } from "date-fns";
import { Ghost } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { markAsGhosted } from "@/actions/applications";
import { ConfirmButton } from "@/components/common/confirm-button";
import { EmptyState } from "@/components/common/empty-state";

type StaleApp = {
  id: string;
  company: string;
  roleTitle: string;
  updatedAt: Date;
};

export function StalePanel({ applications }: { applications: StaleApp[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleGhost(id: string) {
    startTransition(async () => {
      await markAsGhosted(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold text-foreground">
        Stale applications
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Sitting in &ldquo;Applied&rdquo; with no update for 21+ days.
      </p>
      {applications.length === 0 ? (
        <EmptyState
          icon={Ghost}
          title="No stale applications"
          description="Everything in Applied has had recent movement."
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {applications.map((app) => (
            <li
              key={app.id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Link
                href={`/applications/${app.id}`}
                className="min-w-0 flex-1 truncate"
              >
                <span className="font-medium text-foreground">{app.company}</span>{" "}
                <span className="text-muted-foreground">
                  — {app.roleTitle} ·{" "}
                  {differenceInCalendarDays(new Date(), app.updatedAt)}d silent
                </span>
              </Link>
              <ConfirmButton
                label="Mark ghosted"
                confirmLabel="Mark ghosted?"
                size="sm"
                onConfirm={() => handleGhost(app.id)}
                className={isPending ? "opacity-50" : ""}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
