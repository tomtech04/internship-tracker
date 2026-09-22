import { RESUME_VERSIONS, SOURCES, STATUSES, TIERS } from "@/lib/constants";
import { formatDateInput, parseLocalDateInput } from "@/lib/dates";
import { normalizeEnum } from "@/lib/enum-utils";

/**
 * The prompt to paste into a fresh Claude chat, followed by whatever raw
 * details you have (a confirmation email, the job posting, a screenshot
 * description). Claude's reply is designed to paste straight back into
 * this app's "Paste from Claude" box. Keep this in sync with
 * docs/claude-autofill-template.md, which explains the workflow.
 */
export const CLAUDE_AUTOFILL_TEMPLATE = `Extract the following details about my internship application and reply with ONLY a single fenced code block containing these fields, one per line, in this exact order. Leave a field blank if you don't know it. Use YYYY-MM-DD for dates. For Source, Resume Version, Tier, and Status, use exactly one of the listed allowed values (pick the closest match if you're not sure — don't invent new ones). Notes must be the last field and can span multiple lines.

Company:
Role Title:
Team:
Location:
Job URL:
Req ID:
Source: (one of: Career Fair, Referral, Company Site, LinkedIn, Handshake, Other)
Resume Version: (one of: Space, Robotics, Other)
Tier: (one of: Dream, Target, Safety)
Status: (one of: Wishlist, Applied, Online Assessment, Phone Screen, Technical Interview, Final Round, Offer, Accepted, Rejected, Withdrawn, Ghosted)
Date Applied:
Deadline:
Compensation:
Notes:

Here are the details:
[paste the confirmation email, job posting, or describe the application here]`;

/**
 * Field names a pasted block might use, mapped to our canonical keys.
 * Deliberately generous — this is parsing text produced by an unrelated
 * Claude chat, not a machine-generated format we control end to end, so a
 * few reasonable synonyms make it much more forgiving of the user tweaking
 * the template prompt or Claude phrasing things slightly differently.
 */
const FIELD_SYNONYMS: Record<string, string> = {
  company: "companyName",
  "company name": "companyName",
  employer: "companyName",
  "role title": "roleTitle",
  role: "roleTitle",
  position: "roleTitle",
  "job title": "roleTitle",
  title: "roleTitle",
  team: "team",
  group: "team",
  location: "location",
  city: "location",
  "job url": "jobUrl",
  url: "jobUrl",
  "posting url": "jobUrl",
  link: "jobUrl",
  "req id": "reqId",
  "requisition id": "reqId",
  "job id": "reqId",
  source: "source",
  "resume version": "resumeVersion",
  resume: "resumeVersion",
  tier: "tier",
  status: "status",
  "date applied": "dateApplied",
  "applied date": "dateApplied",
  "application date": "dateApplied",
  deadline: "deadline",
  "application deadline": "deadline",
  compensation: "compensation",
  pay: "compensation",
  salary: "compensation",
  notes: "notes",
  note: "notes",
  summary: "notes",
};

export type ParsedAutofillFields = {
  companyName?: string;
  roleTitle?: string;
  team?: string;
  location?: string;
  jobUrl?: string;
  reqId?: string;
  source?: (typeof SOURCES)[number];
  resumeVersion?: (typeof RESUME_VERSIONS)[number];
  tier?: (typeof TIERS)[number];
  status?: (typeof STATUSES)[number];
  dateApplied?: string;
  deadline?: string;
  compensation?: string;
  notes?: string;
};

const LINE_PATTERN = /^\s*([A-Za-z][A-Za-z /]*?)\s*:\s*(.*)$/;

/**
 * Parses the "Field: value" block a Claude chat produces from the autofill
 * template (docs/claude-autofill-template.md) into form-ready values.
 * Notes is treated as the last field — once matched, every remaining line
 * (including ones that look like "Field: value") is captured verbatim as
 * part of the notes text, since notes can reasonably contain colons.
 * Unrecognized lines and unknown field names are silently skipped rather
 * than rejected — this only ever pre-fills a form the user still reviews
 * and submits themselves, so failing soft is the safe default.
 */
export function parseAutofillText(raw: string): ParsedAutofillFields {
  const withoutFence = stripCodeFence(raw);
  const lines = withoutFence.split("\n");
  const result: Record<string, string> = {};

  for (let i = 0; i < lines.length; i++) {
    const match = LINE_PATTERN.exec(lines[i]);
    if (!match) continue;

    const canonical = FIELD_SYNONYMS[match[1].trim().toLowerCase()];
    if (!canonical) continue;

    if (canonical === "notes") {
      const rest = [match[2], ...lines.slice(i + 1)].join("\n").trim();
      if (rest) result.notes = rest;
      break;
    }

    const value = match[2].trim();
    if (value) result[canonical] = value;
  }

  return {
    companyName: result.companyName,
    roleTitle: result.roleTitle,
    team: result.team,
    location: result.location,
    jobUrl: result.jobUrl,
    reqId: result.reqId,
    source: result.source
      ? normalizeEnum(result.source, SOURCES, "Other")
      : undefined,
    resumeVersion: result.resumeVersion
      ? normalizeEnum(result.resumeVersion, RESUME_VERSIONS, "Other")
      : undefined,
    tier: result.tier ? normalizeEnum(result.tier, TIERS, "Target") : undefined,
    status: result.status
      ? normalizeEnum(result.status, STATUSES, "Wishlist")
      : undefined,
    dateApplied: formatDateInput(parseLocalDateInput(result.dateApplied)),
    deadline: formatDateInput(parseLocalDateInput(result.deadline)),
    compensation: result.compensation,
    notes: result.notes,
  };
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = /^```[^\n]*\n([\s\S]*?)\n?```$/.exec(trimmed);
  return fenceMatch ? fenceMatch[1] : trimmed;
}
