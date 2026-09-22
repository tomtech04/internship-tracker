import { describe, expect, it } from "vitest";

import {
  applicationsToCSV,
  identityMapping,
  mapCsvRowToApplicationInput,
  parseCSV,
  type ApplicationCsvRow,
} from "./csv";

const SAMPLE_ROWS: ApplicationCsvRow[] = [
  {
    company: "Acme Aerospace",
    roleTitle: "Mechanical Engineering Intern",
    team: "Structures",
    location: "Denver, CO",
    jobUrl: "https://example.com/jobs/123",
    reqId: "REQ-42",
    source: "Career Fair",
    resumeVersion: "Space",
    tier: "Dream",
    status: "Applied",
    dateApplied: new Date(2026, 7, 10),
    deadline: null,
    followUpDate: new Date(2026, 7, 24),
    nextInterviewDate: null,
    itarRestricted: true,
    compensation: "$40/hr",
    applicationEmail: "student@school.edu",
    notes: "Met the recruiter at the fall career fair.",
    referralName: "Jamie Rivera",
  },
  {
    company: "Beta Robotics",
    roleTitle: "Robotics Intern",
    team: null,
    location: null,
    jobUrl: null,
    reqId: null,
    source: "LinkedIn",
    resumeVersion: "Robotics",
    tier: "Target",
    status: "Wishlist",
    dateApplied: null,
    deadline: null,
    followUpDate: null,
    nextInterviewDate: null,
    itarRestricted: false,
    compensation: null,
    applicationEmail: null,
    notes: null,
    referralName: null,
  },
];

describe("applicationsToCSV / parseCSV round trip", () => {
  it("serializes and re-parses every field without loss", () => {
    const csv = applicationsToCSV(SAMPLE_ROWS);
    const { headers, rows } = parseCSV(csv);

    expect(rows).toHaveLength(2);
    expect(headers).toContain("company");
    expect(headers).toContain("applicationEmail");

    const mapping = identityMapping(headers);
    const roundTripped = rows.map((row) => mapCsvRowToApplicationInput(row, mapping));

    expect(roundTripped[0]).toMatchObject({
      company: "Acme Aerospace",
      roleTitle: "Mechanical Engineering Intern",
      team: "Structures",
      location: "Denver, CO",
      source: "Career Fair",
      resumeVersion: "Space",
      tier: "Dream",
      status: "Applied",
      itarRestricted: true,
      compensation: "$40/hr",
      applicationEmail: "student@school.edu",
    });
    expect(roundTripped[0].dateApplied).toEqual(new Date(2026, 7, 10));
    expect(roundTripped[0].followUpDate).toEqual(new Date(2026, 7, 24));

    expect(roundTripped[1]).toMatchObject({
      company: "Beta Robotics",
      roleTitle: "Robotics Intern",
      source: "LinkedIn",
      resumeVersion: "Robotics",
      tier: "Target",
      status: "Wishlist",
      itarRestricted: false,
    });
    expect(roundTripped[1].team).toBeUndefined();
    expect(roundTripped[1].dateApplied).toBeUndefined();
  });

  it("does not include referralName among the mappable import fields", () => {
    const csv = applicationsToCSV(SAMPLE_ROWS);
    const { headers } = parseCSV(csv);
    const mapping = identityMapping(headers);
    expect("referralName" in mapping).toBe(false);
  });
});

describe("mapCsvRowToApplicationInput", () => {
  it("falls back to sensible defaults for unmapped or unrecognized enum values", () => {
    const result = mapCsvRowToApplicationInput(
      { Company: "Unknown Co", Role: "Some Role", Status: "not-a-real-status" },
      { company: "Company", roleTitle: "Role", status: "Status" },
    );
    expect(result.company).toBe("Unknown Co");
    expect(result.status).toBe("Wishlist");
    expect(result.source).toBe("Other");
    expect(result.tier).toBe("Target");
  });

  it("parses boolean-ish strings for itarRestricted", () => {
    const mapping = { company: "c", roleTitle: "r", itarRestricted: "itar" };
    expect(
      mapCsvRowToApplicationInput({ c: "A", r: "B", itar: "yes" }, mapping)
        .itarRestricted,
    ).toBe(true);
    expect(
      mapCsvRowToApplicationInput({ c: "A", r: "B", itar: "no" }, mapping)
        .itarRestricted,
    ).toBe(false);
  });
});
