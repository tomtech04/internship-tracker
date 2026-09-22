import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

import {
  AUTO_FOLLOW_UP_DAYS,
  STALE_THRESHOLD_DAYS,
  STATUS_RANK,
  type Status,
} from "@/lib/constants";

/** Separator used inside a "Status Change" event's description. Chosen to
 * be unambiguous with company/role names while staying human-readable. */
const STATUS_CHANGE_ARROW = "→"; // "→"

/**
 * Builds the Event fields to log whenever an application's status changes.
 * The description encodes both the old and new status in a fixed,
 * parseable format (see `parseStatusChangeEvent`) so historical progress
 * (e.g. "reached Technical Interview before being rejected") can be
 * recovered later for the funnel chart and response-rate calculation.
 */
export function buildStatusChangeEvent(
  oldStatus: Status,
  newStatus: Status,
  date: Date = new Date(),
) {
  return {
    type: "Status Change" as const,
    date,
    description: `Status changed: ${oldStatus} ${STATUS_CHANGE_ARROW} ${newStatus}`,
  };
}

/** Recovers the old/new status from a "Status Change" event description
 * produced by `buildStatusChangeEvent`. Returns null for any other event. */
export function parseStatusChangeEvent(
  description: string,
): { from: Status; to: Status } | null {
  const match = description.match(
    /^Status changed: (.+?) → (.+)$/u,
  );
  if (!match) return null;
  const [, from, to] = match;
  if (!(from in STATUS_RANK) || !(to in STATUS_RANK)) return null;
  return { from: from as Status, to: to as Status };
}

/**
 * Follow-up automation: when an application's status changes to "Applied"
 * and it doesn't already have a follow-up date, auto-set one 14 days out.
 * Returns the date to apply, or null if no automation should fire (caller
 * should leave the existing value untouched in that case).
 */
export function computeAutoFollowUpDate(
  newStatus: Status,
  existingFollowUpDate: Date | null | undefined,
  referenceDate: Date = new Date(),
): Date | null {
  if (newStatus !== "Applied") return null;
  if (existingFollowUpDate) return null;
  return startOfDay(addDays(referenceDate, AUTO_FOLLOW_UP_DAYS));
}

/**
 * Stale detection: an application is stale once it has sat in "Applied"
 * with no update for STALE_THRESHOLD_DAYS or more.
 */
export function isStale(
  application: { status: Status; updatedAt: Date },
  now: Date = new Date(),
  thresholdDays: number = STALE_THRESHOLD_DAYS,
): boolean {
  if (application.status !== "Applied") return false;
  return differenceInCalendarDays(now, application.updatedAt) >= thresholdDays;
}

type AppWithEvents = {
  status: Status;
  events: { type: string; description: string }[];
};

/** Highest pipeline rank ever reached by an application, based on its
 * current status plus every "Status Change" event in its history. */
export function maxRankReached(application: AppWithEvents): number {
  const statusesSeen: Status[] = [application.status];
  for (const event of application.events) {
    if (event.type !== "Status Change") continue;
    const parsed = parseStatusChangeEvent(event.description);
    if (parsed) statusesSeen.push(parsed.to);
  }
  return Math.max(...statusesSeen.map((s) => STATUS_RANK[s] ?? 0));
}

/**
 * Response rate: percent of applications that were actually applied to
 * (i.e. left "Wishlist") which moved past the initial "Applied" stage at
 * some point — an application later rejected after a phone screen still
 * counts, since it did get a response.
 */
export function calculateResponseRate(applications: AppWithEvents[]): number {
  const appliedPool = applications.filter((a) => maxRankReached(a) >= 1);
  if (appliedPool.length === 0) return 0;
  const movedPast = appliedPool.filter((a) => maxRankReached(a) >= 2);
  return (movedPast.length / appliedPool.length) * 100;
}

export type FunnelStage = "Applied" | "Screen" | "Interview" | "Offer";
export const FUNNEL_STAGES: FunnelStage[] = [
  "Applied",
  "Screen",
  "Interview",
  "Offer",
];

const FUNNEL_MIN_RANK: Record<FunnelStage, number> = {
  Applied: 1,
  Screen: 2,
  Interview: 3,
  Offer: 4,
};

/** Cumulative funnel counts: how many applications ever reached each stage. */
export function calculateFunnel(
  applications: AppWithEvents[],
): Record<FunnelStage, number> {
  const ranks = applications.map(maxRankReached);
  const result = {} as Record<FunnelStage, number>;
  for (const stage of FUNNEL_STAGES) {
    result[stage] = ranks.filter((r) => r >= FUNNEL_MIN_RANK[stage]).length;
  }
  return result;
}
