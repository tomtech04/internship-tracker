import { describe, expect, it } from "vitest";

import { backupApplicationSchema } from "./backup";

const BASE = {
  id: "app_1",
  company: "Acme",
  roleTitle: "Intern",
  team: null,
  location: null,
  jobUrl: null,
  reqId: null,
  source: "Company Site",
  resumeVersion: "Space",
  tier: "Target",
  status: "Wishlist",
  referralId: null,
  itarRestricted: false,
  compensation: null,
  applicationEmail: null,
  notes: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("backupApplicationSchema nullable dates", () => {
  it("keeps a null date field null instead of coercing it to the Unix epoch", () => {
    // Regression test: z.union([z.coerce.date(), z.null()]) would silently
    // turn null into 1970-01-01, since `new Date(null)` is a "valid" Date
    // as far as z.coerce.date() is concerned. See backup.ts for the fix.
    const result = backupApplicationSchema.parse({
      ...BASE,
      dateApplied: null,
      deadline: null,
      followUpDate: null,
      nextInterviewDate: null,
    });
    expect(result.dateApplied).toBeNull();
    expect(result.deadline).toBeNull();
    expect(result.followUpDate).toBeNull();
    expect(result.nextInterviewDate).toBeNull();
  });

  it("still parses a real ISO date string into a Date", () => {
    const result = backupApplicationSchema.parse({
      ...BASE,
      dateApplied: "2026-08-10T00:00:00.000Z",
      deadline: null,
      followUpDate: null,
      nextInterviewDate: null,
    });
    expect(result.dateApplied).toEqual(new Date("2026-08-10T00:00:00.000Z"));
  });
});
