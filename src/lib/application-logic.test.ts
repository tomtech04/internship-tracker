import { describe, expect, it } from "vitest";

import {
  buildStatusChangeEvent,
  calculateFunnel,
  calculateResponseRate,
  computeAutoFollowUpDate,
  isStale,
  maxRankReached,
  parseStatusChangeEvent,
} from "./application-logic";

describe("buildStatusChangeEvent / parseStatusChangeEvent", () => {
  it("logs a Status Change event with the old and new status", () => {
    const event = buildStatusChangeEvent(
      "Wishlist",
      "Applied",
      new Date("2026-01-05"),
    );
    expect(event.type).toBe("Status Change");
    expect(event.date).toEqual(new Date("2026-01-05"));
    expect(event.description).toContain("Wishlist");
    expect(event.description).toContain("Applied");
  });

  it("round-trips through parseStatusChangeEvent", () => {
    const event = buildStatusChangeEvent("Phone Screen", "Technical Interview");
    const parsed = parseStatusChangeEvent(event.description);
    expect(parsed).toEqual({ from: "Phone Screen", to: "Technical Interview" });
  });

  it("returns null for descriptions that aren't status-change events", () => {
    expect(parseStatusChangeEvent("Sent a thank-you email")).toBeNull();
  });
});

describe("computeAutoFollowUpDate", () => {
  it("sets a follow-up 14 days out when moving to Applied with none set", () => {
    const reference = new Date(2026, 0, 1);
    const result = computeAutoFollowUpDate("Applied", null, reference);
    expect(result).toEqual(new Date(2026, 0, 15));
  });

  it("does not override an existing follow-up date", () => {
    const existing = new Date(2026, 0, 20);
    const result = computeAutoFollowUpDate("Applied", existing, new Date(2026, 0, 1));
    expect(result).toBeNull();
  });

  it("does nothing for statuses other than Applied", () => {
    expect(computeAutoFollowUpDate("Technical Interview", null)).toBeNull();
    expect(computeAutoFollowUpDate("Wishlist", null)).toBeNull();
  });
});

describe("isStale", () => {
  it("flags an Applied application with no update in 21+ days", () => {
    const now = new Date(2026, 5, 1);
    const updatedAt = new Date(2026, 4, 1); // 31 days earlier
    expect(isStale({ status: "Applied", updatedAt }, now)).toBe(true);
  });

  it("does not flag a recently-updated Applied application", () => {
    const now = new Date(2026, 5, 1);
    const updatedAt = new Date(2026, 4, 20); // 12 days earlier
    expect(isStale({ status: "Applied", updatedAt }, now)).toBe(false);
  });

  it("only applies to the Applied status", () => {
    const now = new Date(2026, 5, 1);
    const updatedAt = new Date(2026, 3, 1); // long ago
    expect(isStale({ status: "Wishlist", updatedAt }, now)).toBe(false);
    expect(isStale({ status: "Technical Interview", updatedAt }, now)).toBe(false);
  });
});

describe("maxRankReached / calculateResponseRate", () => {
  it("credits an application for the highest stage it ever reached", () => {
    const rejectedAfterInterview = {
      status: "Rejected",
      events: [
        {
          type: "Status Change",
          description: "Status changed: Wishlist → Applied",
        },
        {
          type: "Status Change",
          description: "Status changed: Applied → Technical Interview",
        },
        {
          type: "Status Change",
          description: "Status changed: Technical Interview → Rejected",
        },
      ],
    };
    expect(maxRankReached(rejectedAfterInterview)).toBe(3);
  });

  it("computes the percent of applied applications that moved past Applied", () => {
    const applications = [
      // Wishlist — excluded from the denominator entirely.
      { status: "Wishlist" as const, events: [] },
      // Applied, never moved — counts against the rate.
      { status: "Applied" as const, events: [] },
      // Reached a phone screen before being rejected — still counts as "moved past".
      {
        status: "Rejected" as const,
        events: [
          {
            type: "Status Change",
            description: "Status changed: Applied → Phone Screen",
          },
          {
            type: "Status Change",
            description: "Status changed: Phone Screen → Rejected",
          },
        ],
      },
      // Currently at Offer — counts as "moved past".
      { status: "Offer" as const, events: [] },
    ];

    // Applied pool = 3 (Applied, Rejected, Offer). Moved past = 2 (Rejected, Offer).
    expect(calculateResponseRate(applications)).toBeCloseTo((2 / 3) * 100);
  });

  it("returns 0 when nothing has been applied to yet", () => {
    expect(calculateResponseRate([{ status: "Wishlist", events: [] }])).toBe(0);
    expect(calculateResponseRate([])).toBe(0);
  });
});

describe("calculateFunnel", () => {
  it("counts applications cumulatively through each stage", () => {
    const applications = [
      { status: "Wishlist" as const, events: [] },
      { status: "Applied" as const, events: [] },
      { status: "Offer" as const, events: [] },
    ];
    const funnel = calculateFunnel(applications);
    expect(funnel).toEqual({ Applied: 2, Screen: 1, Interview: 1, Offer: 1 });
  });
});
