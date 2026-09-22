import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import { AlertCircle, CalendarClock, Clock } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";

type Row = { id: string; company: string; roleTitle: string };

function dueLabel(date: Date) {
  const days = differenceInCalendarDays(startOfDay(new Date()), startOfDay(date));
  if (days === 0) return "Due today";
  if (days > 0) return `Overdue by ${days} day${days === 1 ? "" : "s"}`;
  return `In ${-days} day${days === -1 ? "" : "s"}`;
}

function Section({
  title,
  icon: Icon,
  rows,
  getDate,
}: {
  title: string;
  icon: typeof Clock;
  rows: (Row & { date: Date })[];
  getDate: (date: Date) => string;
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon size={14} />
        {title} ({rows.length})
      </h4>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here. 🎉</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/applications/${row.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <span className="truncate">
                  <span className="font-medium text-foreground">{row.company}</span>{" "}
                  <span className="text-muted-foreground">— {row.roleTitle}</span>
                </span>
                <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                  {getDate(row.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ActionNeededPanel({
  followUpsDue,
  interviewsUpcoming,
  deadlinesUpcoming,
}: {
  followUpsDue: (Row & { followUpDate: Date | null })[];
  interviewsUpcoming: (Row & { nextInterviewDate: Date | null })[];
  deadlinesUpcoming: (Row & { deadline: Date | null })[];
}) {
  const total =
    followUpsDue.length + interviewsUpcoming.length + deadlinesUpcoming.length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Action needed
      </h3>
      {total === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="Nothing needs your attention"
          description="Follow-ups, interviews, and deadlines will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Section
            title="Follow-ups due"
            icon={Clock}
            rows={followUpsDue.map((r) => ({ ...r, date: r.followUpDate! }))}
            getDate={dueLabel}
          />
          <Section
            title="Interviews next 7 days"
            icon={CalendarClock}
            rows={interviewsUpcoming.map((r) => ({ ...r, date: r.nextInterviewDate! }))}
            getDate={(d) => format(d, "EEE, MMM d")}
          />
          <Section
            title="Deadlines next 7 days"
            icon={AlertCircle}
            rows={deadlinesUpcoming.map((r) => ({ ...r, date: r.deadline! }))}
            getDate={(d) => format(d, "EEE, MMM d")}
          />
        </div>
      )}
    </div>
  );
}
