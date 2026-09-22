"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import Link from "next/link";

import { TierBadge } from "@/components/common/badges";

export type BoardApplication = {
  id: string;
  company: string;
  roleTitle: string;
  tier: string;
  deadline: Date | null;
  nextInterviewDate: Date | null;
};

export function ApplicationCard({
  application,
  dragging = false,
}: {
  application: BoardApplication;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: application.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-border bg-background flex items-start gap-1 rounded-md border p-2.5 shadow-sm ${
        isDragging || dragging ? "opacity-60 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`Reorder ${application.company} card`}
        className="text-muted-foreground hover:bg-muted mt-0.5 cursor-grab touch-none rounded p-0.5 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      <Link
        href={`/applications/${application.id}`}
        className="focus-visible:ring-ring min-w-0 flex-1 rounded focus-visible:ring-2 focus-visible:outline-none"
      >
        <p className="text-foreground truncate text-sm font-medium">
          {application.company}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {application.roleTitle}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <TierBadge tier={application.tier} />
          {application.nextInterviewDate ? (
            <span className="text-[11px] whitespace-nowrap text-violet-600 dark:text-violet-400">
              Interview {format(application.nextInterviewDate, "MMM d")}
            </span>
          ) : application.deadline ? (
            <span className="text-muted-foreground text-[11px] whitespace-nowrap">
              Due {format(application.deadline, "MMM d")}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
