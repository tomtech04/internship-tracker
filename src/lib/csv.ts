import Papa from "papaparse";

import {
  RESUME_VERSIONS,
  SOURCES,
  STATUSES,
  TIERS,
  type ResumeVersion,
  type Source,
  type Status,
  type Tier,
} from "@/lib/constants";
import { formatDateInput, parseLocalDateInput } from "@/lib/dates";
import { normalizeEnum } from "@/lib/enum-utils";

export const APPLICATION_CSV_FIELDS = [
  "companyName",
  "roleTitle",
  "team",
  "location",
  "jobUrl",
  "reqId",
  "source",
  "resumeVersion",
  "tier",
  "status",
  "dateApplied",
  "deadline",
  "followUpDate",
  "nextInterviewDate",
  "itarRestricted",
  "compensation",
  "notes",
  "referralName",
] as const;

export type ApplicationCsvField = (typeof APPLICATION_CSV_FIELDS)[number];

export type ApplicationCsvRow = {
  companyName: string;
  roleTitle: string;
  team: string | null;
  location: string | null;
  jobUrl: string | null;
  reqId: string | null;
  source: string;
  resumeVersion: string;
  tier: string;
  status: string;
  dateApplied: Date | null;
  deadline: Date | null;
  followUpDate: Date | null;
  nextInterviewDate: Date | null;
  itarRestricted: boolean;
  compensation: string | null;
  notes: string | null;
  referralName: string | null;
};

function dateToCsv(d: Date | null): string {
  return formatDateInput(d);
}

/** Serializes applications to a CSV string. Column order matches
 * APPLICATION_CSV_FIELDS so the export can be re-imported without mapping.
 * Portal credentials live on the Company record, not here, and are
 * deliberately never included in this export. */
export function applicationsToCSV(applications: ApplicationCsvRow[]): string {
  const rows = applications.map((app) => ({
    companyName: app.companyName,
    roleTitle: app.roleTitle,
    team: app.team ?? "",
    location: app.location ?? "",
    jobUrl: app.jobUrl ?? "",
    reqId: app.reqId ?? "",
    source: app.source,
    resumeVersion: app.resumeVersion,
    tier: app.tier,
    status: app.status,
    dateApplied: dateToCsv(app.dateApplied),
    deadline: dateToCsv(app.deadline),
    followUpDate: dateToCsv(app.followUpDate),
    nextInterviewDate: dateToCsv(app.nextInterviewDate),
    itarRestricted: app.itarRestricted ? "true" : "false",
    compensation: app.compensation ?? "",
    notes: app.notes ?? "",
    referralName: app.referralName ?? "",
  }));
  return Papa.unparse(
    { fields: [...APPLICATION_CSV_FIELDS], data: rows },
    { newline: "\n" },
  );
}

/** Parses raw CSV text into header-keyed rows of strings, for preview and
 * column-mapping before the values are coerced into an ApplicationInput. */
export function parseCSV(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const result = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  });
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  };
}

function normalizeDate(value: string | undefined): Date | undefined {
  return parseLocalDateInput(value);
}

function normalizeBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ["true", "yes", "1", "y"].includes(value.trim().toLowerCase());
}

export type ApplicationImportMapping = Partial<
  Record<Exclude<ApplicationCsvField, "referralName">, string | null>
>;

export type CoercedImportRow = {
  companyName: string;
  roleTitle: string;
  team?: string;
  location?: string;
  jobUrl?: string;
  reqId?: string;
  source: Source;
  resumeVersion: ResumeVersion;
  tier: Tier;
  status: Status;
  dateApplied?: Date;
  deadline?: Date;
  followUpDate?: Date;
  nextInterviewDate?: Date;
  itarRestricted: boolean;
  compensation?: string;
  notes?: string;
};

/**
 * Applies a user-chosen column mapping to one raw CSV row and coerces it
 * into typed, schema-ready values. Unrecognized enum values fall back to a
 * sensible default rather than rejecting the whole row — the caller is
 * expected to still run the result through `applicationSchema` for the
 * fields that truly are required (companyName, roleTitle). companyName is
 * resolved to a companyId (finding or creating the company) by the caller.
 */
export function mapCsvRowToApplicationInput(
  row: Record<string, string>,
  mapping: ApplicationImportMapping,
): CoercedImportRow {
  const get = (field: keyof ApplicationImportMapping) => {
    const column = mapping[field];
    return column ? row[column]?.trim() : undefined;
  };

  return {
    companyName: get("companyName") ?? "",
    roleTitle: get("roleTitle") ?? "",
    team: get("team") || undefined,
    location: get("location") || undefined,
    jobUrl: get("jobUrl") || undefined,
    reqId: get("reqId") || undefined,
    source: normalizeEnum(get("source"), SOURCES, "Other"),
    resumeVersion: normalizeEnum(
      get("resumeVersion"),
      RESUME_VERSIONS,
      "Other",
    ),
    tier: normalizeEnum(get("tier"), TIERS, "Target"),
    status: normalizeEnum(get("status"), STATUSES, "Wishlist"),
    dateApplied: normalizeDate(get("dateApplied")),
    deadline: normalizeDate(get("deadline")),
    followUpDate: normalizeDate(get("followUpDate")),
    nextInterviewDate: normalizeDate(get("nextInterviewDate")),
    itarRestricted: normalizeBoolean(get("itarRestricted")),
    compensation: get("compensation") || undefined,
    notes: get("notes") || undefined,
  };
}

/** Identity mapping used when a CSV was produced by our own export — column
 * names already match field names, so no manual mapping step is needed. */
export function identityMapping(headers: string[]): ApplicationImportMapping {
  const mapping: ApplicationImportMapping = {};
  for (const field of APPLICATION_CSV_FIELDS) {
    if (field === "referralName") continue;
    if (headers.includes(field)) {
      mapping[field] = field;
    }
  }
  return mapping;
}
