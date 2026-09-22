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
      className={`border-border bg-muted/40 flex w-64 shrink-0 flex-col rounded-lg border transition-colors ${
        isOver ? "bg-primary/10 ring-primary ring-2" : ""
      }`}
    >
      <div className="border-border flex items-center justify-between gap-2 border-b px-2.5 py-2">
        <StatusBadge status={status} />
        <span className="text-muted-foreground text-xs font-medium">
          {applications.length}
        </span>
      </div>
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
        style={{ minHeight: 120 }}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="text-muted-foreground px-1 py-4 text-center text-xs">
            Drop here
          </p>
        )}
      </div>
    </div>
  );
}
