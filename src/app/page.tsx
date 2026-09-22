import { Rocket } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ActionNeededPanel } from "@/components/dashboard/action-needed-panel";
import { FunnelChartCard } from "@/components/dashboard/funnel-chart-card";
import { ResponseRateCard } from "@/components/dashboard/response-rate-card";
import { StalePanel } from "@/components/dashboard/stale-panel";
import { StatusCountsGrid } from "@/components/dashboard/status-counts-grid";
import { WeeklyChartCard } from "@/components/dashboard/weekly-chart-card";
import {
  buildActionNeeded,
  buildFunnelData,
  buildResponseRate,
  buildStaleApplications,
  buildStatusCounts,
  buildWeeklySubmissions,
} from "@/lib/dashboard";
import { getAllApplications } from "@/lib/queries";

export default async function DashboardPage() {
  const applications = await getAllApplications();

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title="No applications yet"
        description="Press N anywhere to quick-add your first application, or start from a full form."
        action={
          <Link
            href="/applications/new"
            className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            New application
          </Link>
        }
      />
    );
  }

  const statusCounts = buildStatusCounts(applications);
  const funnelData = buildFunnelData(applications);
  const responseRate = buildResponseRate(applications);
  const weeklyData = buildWeeklySubmissions(applications);
  const actionNeeded = buildActionNeeded(applications);
  const staleApps = buildStaleApplications(applications);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusCountsGrid counts={statusCounts} />
        </div>
        <ResponseRateCard rate={responseRate} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelChartCard data={funnelData} />
        <WeeklyChartCard data={weeklyData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActionNeededPanel
          followUpsDue={actionNeeded.followUpsDue}
          interviewsUpcoming={actionNeeded.interviewsUpcoming}
          deadlinesUpcoming={actionNeeded.deadlinesUpcoming}
        />
        <StalePanel applications={staleApps} />
      </div>
    </div>
  );
}
