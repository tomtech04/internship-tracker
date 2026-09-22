import { format, startOfDay } from "date-fns";

/**
 * Application dates (dateApplied, deadline, followUpDate,
 * nextInterviewDate, lastContactedDate) represent a calendar day, not an
 * instant — they come from <input type="date"> and have no time-of-day.
 *
 * A plain `new Date("2026-10-15")` parses as UTC midnight per the ECMA-262
 * date-only string format, which renders as the *previous* day in any
 * timezone behind UTC (all of the US). Parsing into LOCAL midnight instead,
 * and always formatting back out with local-time `format`, keeps the
 * calendar date stable no matter what timezone the machine is in.
 */
export function parseLocalDateInput(
  value: string | Date | null | undefined,
): Date | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) return startOfDay(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? undefined : fallback;
  }
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/** Formats a date-only field for an <input type="date"> value or CSV cell. */
export function formatDateInput(date: Date | null | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}
