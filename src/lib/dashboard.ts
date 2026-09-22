import {
  addDays,
  endOfDay,
  format,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";

import {
  calculateFunnel,
  calculateResponseRate,
  isStale,
} from "@/lib/application-logic";
import {
  STATUSES,
  TERMINAL_STATUSES,
  UPCOMING_WINDOW_DAYS,
  type Status,
} from "@/lib/constants";

export type DashboardApplication = {
  id: string;
  company: string;
  roleTitle: string;
  status: Status;
  tier: string;
  updatedAt: Date;
  dateApplied: Date | null;
  deadline: Date | null;
  followUpDate: Date | null;
  nextInterviewDate: Date | null;
  events: { type: string; description: string }[];
};

export function buildStatusCounts(applications: DashboardApplication[]) {
  const counts = new Map<Status, number>(STATUSES.map((s) => [s, 0]));
  for (const app of applications) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
  }
  return STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

export function buildFunnelData(applications: DashboardApplication[]) {
  const funnel = calculateFunnel(applications);
  return Object.entries(funnel).map(([stage, count]) => ({ stage, count }));
}

export function buildResponseRate(applications: DashboardApplication[]) {
  return calculateResponseRate(applications);
}

/** Applications submitted per week, most recent `weeksBack` weeks (Mon-Sun). */
export function buildWeeklySubmissions(
  applications: DashboardApplication[],
  weeksBack = 10,
) {
  const today = startOfDay(new Date());
  const weekStarts = Array.from({ length: weeksBack }, (_, i) =>
    startOfWeek(subWeeks(today, weeksBack - 1 - i), { weekStartsOn: 1 }),
  );

  return weekStarts.map((weekStart) => {
    const weekEnd = addDays(weekStart, 7);
    const count = applications.filter((app) => {
      const d = app.dateApplied;
      return d && d >= weekStart && d < weekEnd;
    }).length;
    return { week: format(weekStart, "MMM d"), count };
  });
}

export function buildActionNeeded(applications: DashboardApplication[]) {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(today);
  const windowEnd = endOfDay(addDays(today, UPCOMING_WINDOW_DAYS));
  const active = applications.filter(
    (a) => !TERMINAL_STATUSES.includes(a.status),
  );

  const followUpsDue = active
    .filter((a) => a.followUpDate && a.followUpDate <= todayEnd)
    .sort((a, b) => a.followUpDate!.getTime() - b.followUpDate!.getTime());

  const interviewsUpcoming = active
    .filter(
      (a) =>
        a.nextInterviewDate &&
        a.nextInterviewDate >= today &&
        a.nextInterviewDate <= windowEnd,
    )
    .sort(
      (a, b) => a.nextInterviewDate!.getTime() - b.nextInterviewDate!.getTime(),
    );

  const deadlinesUpcoming = active
    .filter((a) => a.deadline && a.deadline >= today && a.deadline <= windowEnd)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());

  return { followUpsDue, interviewsUpcoming, deadlinesUpcoming };
}

export function buildStaleApplications(applications: DashboardApplication[]) {
  const now = new Date();
  return applications
    .filter((a) => isStale(a, now))
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
}
