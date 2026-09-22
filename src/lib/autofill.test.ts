import { describe, expect, it } from "vitest";

import { parseAutofillText } from "./autofill";

describe("parseAutofillText", () => {
  it("parses a full block into form-ready fields", () => {
    const text = `
Company: SpaceX
Role Title: Mechanical Engineering Intern
Team: Structures
Location: Hawthorne, CA
Job URL: https://spacex.com/careers/123
Req ID: REQ-456
Source: Career Fair
Resume Version: Space
Tier: Dream
Status: Applied
Date Applied: 2026-09-15
Deadline: 2026-10-01
Compensation: $45/hr
Notes: Talked to a recruiter at the fall career fair, mentioned they're expanding the structures team.
`;
    const result = parseAutofillText(text);
    expect(result).toMatchObject({
      companyName: "SpaceX",
      roleTitle: "Mechanical Engineering Intern",
      team: "Structures",
      location: "Hawthorne, CA",
      jobUrl: "https://spacex.com/careers/123",
      reqId: "REQ-456",
      source: "Career Fair",
      resumeVersion: "Space",
      tier: "Dream",
      status: "Applied",
      dateApplied: "2026-09-15",
      deadline: "2026-10-01",
      compensation: "$45/hr",
      notes:
        "Talked to a recruiter at the fall career fair, mentioned they're expanding the structures team.",
    });
  });

  it("strips a fenced code block wrapper", () => {
    const text = "```text\nCompany: Blue Origin\nRole Title: Intern\n```";
    const result = parseAutofillText(text);
    expect(result.companyName).toBe("Blue Origin");
    expect(result.roleTitle).toBe("Intern");
  });

  it("falls back sensibly for unrecognized enum values and ignores unknown fields", () => {
    const text = [
      "Company: Acme",
      "Status: Somewhere In Between",
      "Favorite Color: blue",
    ].join("\n");
    const result = parseAutofillText(text);
    expect(result.companyName).toBe("Acme");
    expect(result.status).toBe("Wishlist");
  });

  it("captures multi-line notes, including lines that look like fields", () => {
    const text = [
      "Company: Acme",
      "Notes: First line.",
      "Second line with a Time: 3pm mentioned in it.",
      "Third line.",
    ].join("\n");
    const result = parseAutofillText(text);
    expect(result.notes).toBe(
      "First line.\nSecond line with a Time: 3pm mentioned in it.\nThird line.",
    );
  });

  it("leaves fields undefined when nothing is provided", () => {
    const result = parseAutofillText("Company: Acme");
    expect(result.roleTitle).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });
});
