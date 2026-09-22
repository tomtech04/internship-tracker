import type { Status, Tier } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Status, string> = {
  Wishlist:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  Applied: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "Online Assessment":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "Phone Screen":
    "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "Technical Interview":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "Final Round":
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
  Offer: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Withdrawn: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  Ghosted:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status as Status] ?? STATUS_STYLES.Wishlist;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
      )}
    >
      {status}
    </span>
  );
}

const TIER_STYLES: Record<Tier, string> = {
  Dream: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  Target: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  Safety: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
};

export function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier as Tier] ?? TIER_STYLES.Target;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
      )}
    >
      {tier}
    </span>
  );
}
