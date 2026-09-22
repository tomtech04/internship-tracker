// SQLite has no native enum support in Prisma, so every "enum" below is a
// plain string column. These arrays are the single source of truth for the
// allowed values — Zod schemas and <select> options both derive from them.

export const SOURCES = [
  "Career Fair",
  "Referral",
  "Company Site",
  "LinkedIn",
  "Handshake",
  "Other",
] as const;
export type Source = (typeof SOURCES)[number];

export const RESUME_VERSIONS = ["Space", "Robotics", "Other"] as const;
export type ResumeVersion = (typeof RESUME_VERSIONS)[number];

export const TIERS = ["Dream", "Target", "Safety"] as const;
export type Tier = (typeof TIERS)[number];

export const STATUSES = [
  "Wishlist",
  "Applied",
  "Online Assessment",
  "Phone Screen",
  "Technical Interview",
  "Final Round",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Ghosted",
] as const;
export type Status = (typeof STATUSES)[number];

/** Statuses that represent a closed-out application. Excluded from the
 * kanban board and from "action needed" / "stale" panels since there's
 * nothing left to act on. */
export const TERMINAL_STATUSES: Status[] = [
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Ghosted",
];

/** Statuses shown as columns on the kanban board — the active pipeline,
 * i.e. everything that isn't a closed-out outcome. */
export const BOARD_STATUSES: Status[] = STATUSES.filter(
  (s) => !TERMINAL_STATUSES.includes(s),
);

/**
 * Pipeline progress rank per status, used to compute the funnel chart and
 * response rate from an application's full status-change history (not just
 * its current status) — so an application that reached "Technical Interview"
 * before being rejected still counts as having reached the interview stage.
 * Terminal outcomes rank low on their own; what matters is the highest rank
 * ever seen across an application's event history.
 */
export const STATUS_RANK: Record<Status, number> = {
  Wishlist: 0,
  Applied: 1,
  "Online Assessment": 2,
  "Phone Screen": 2,
  "Technical Interview": 3,
  "Final Round": 3,
  Offer: 4,
  Accepted: 4,
  Rejected: 0,
  Withdrawn: 0,
  Ghosted: 0,
};

export const RELATIONSHIPS = [
  "Friend",
  "Alumni",
  "Recruiter",
  "Referral",
  "Other",
] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const EVENT_TYPES = [
  "Status Change",
  "Note",
  "Email",
  "Interview",
  "Follow-up",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const STALE_THRESHOLD_DAYS = 21;
export const AUTO_FOLLOW_UP_DAYS = 14;
export const UPCOMING_WINDOW_DAYS = 7;
