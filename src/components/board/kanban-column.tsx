"use client";

import { useDroppable } from "@dnd-kit/core";

import { StatusBadge } from "@/components/common/badges";
import type { Status } from "@/lib/constants";

import { ApplicationCard, type BoardApplication } from "./application-card";

export function KanbanColumn({
  status,
  applications,
}: {
  status: Status;
  applications: BoardApplication[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-lg border border-border bg-muted/40 transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-2">
        <StatusBadge status={status} />
        <span className="text-xs font-medium text-muted-foreground">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ minHeight: 120 }}>
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="px-1 py-4 text-center text-xs text-muted-foreground">
            Drop here
          </p>
        )}
      </div>
    </div>
  );
}
