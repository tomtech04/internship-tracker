import { Table2 } from "lucide-react";

import { ApplicationsTable } from "@/components/table/applications-table";
import { EmptyState } from "@/components/common/empty-state";
import type { Status } from "@/lib/constants";
import { getAllApplications } from "@/lib/queries";

export default async function TablePage() {
  const applications = await getAllApplications();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">
        All applications
      </h1>
      {applications.length === 0 ? (
        <EmptyState
          icon={Table2}
          title="No applications yet"
          description="Applications you add will show up here in a sortable, filterable table."
        />
      ) : (
        <ApplicationsTable
          applications={applications.map((a) => ({
            id: a.id,
            company: a.company,
            roleTitle: a.roleTitle,
            team: a.team,
            location: a.location,
            notes: a.notes,
            status: a.status as Status,
            tier: a.tier,
            resumeVersion: a.resumeVersion,
            source: a.source,
            dateApplied: a.dateApplied,
            deadline: a.deadline,
            followUpDate: a.followUpDate,
            nextInterviewDate: a.nextInterviewDate,
            applicationEmail: a.applicationEmail,
            referralName: a.referral?.name ?? null,
          }))}
        />
      )}
    </div>
  );
}
