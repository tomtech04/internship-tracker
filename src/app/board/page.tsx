import { KanbanSquare } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { KanbanBoard } from "@/components/board/kanban-board";
import { BOARD_STATUSES } from "@/lib/constants";
import { getAllApplications } from "@/lib/queries";

export default async function BoardPage() {
  const applications = await getAllApplications();
  const boardApps = applications.filter((a) =>
    BOARD_STATUSES.includes(a.status as (typeof BOARD_STATUSES)[number]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-xl font-semibold">Board</h1>
        <p className="text-muted-foreground text-xs">
          Closed-out applications (Accepted, Rejected, Withdrawn, Ghosted) live
          in the{" "}
          <Link href="/table" className="underline underline-offset-2">
            table view
          </Link>
          .
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No applications yet"
          description="Applications you add will show up here as draggable cards, grouped by status."
        />
      ) : (
        <KanbanBoard
          applications={boardApps.map((a) => ({
            id: a.id,
            company: a.company.name,
            roleTitle: a.roleTitle,
            tier: a.tier,
            status: a.status as (typeof BOARD_STATUSES)[number],
            deadline: a.deadline,
            nextInterviewDate: a.nextInterviewDate,
          }))}
        />
      )}
    </div>
  );
}
