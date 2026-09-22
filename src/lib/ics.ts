import { format } from "date-fns";

export type IcsEvent = {
  uid: string;
  date: Date;
  summary: string;
  description?: string;
};

/** Escapes TEXT-type values per RFC 5545 section 3.3.11. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Folds a content line to 75 octets as required by RFC 5545 section 3.1. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

/**
 * Builds an .ics calendar (RFC 5545) of all-day events for upcoming
 * interviews and follow-ups. We only track calendar dates (no times), so
 * every event is emitted as an all-day VEVENT.
 */
export function generateICS(events: IcsEvent[]): string {
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Internship Tracker//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(foldLine(`UID:${event.uid}`));
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${format(event.date, "yyyyMMdd")}`);
    lines.push(foldLine(`SUMMARY:${escapeText(event.summary)}`));
    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeText(event.description)}`));
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
