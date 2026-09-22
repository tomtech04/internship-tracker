import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  buildStatusChangeEvent,
  computeAutoFollowUpDate,
} from "../src/lib/application-logic";
import type { Status } from "../src/lib/constants";
import { parseLocalDateInput } from "../src/lib/dates";

type SeedCompany = {
  name: string;
  website?: string;
  portalUsername?: string;
  portalPassword?: string;
  notes?: string;
};

type SeedContact = {
  name: string;
  company?: string;
  role?: string;
  relationship: string;
  howWeMet?: string;
  email?: string;
  linkedinUrl?: string;
  nextStep?: string;
  notes?: string;
};

type SeedApplication = {
  /** Matched case-insensitively against `companies[].name` — if there's
   * no match, a bare company record is created automatically (same
   * find-or-create behavior as quick add and CSV import). */
  companyName: string;
  roleTitle: string;
  team?: string;
  location?: string;
  jobUrl?: string;
  reqId?: string;
  source: string;
  resumeVersion: string;
  tier: string;
  status: string;
  dateApplied?: string;
  deadline?: string;
  followUpDate?: string;
  nextInterviewDate?: string;
  itarRestricted?: boolean;
  compensation?: string;
  notes?: string;
  referralContactName?: string;
  /** Demo-only knob: backdate updatedAt so the dashboard's "stale" panel
   * has something to show. Ignored if omitted (defaults to now). */
  updatedAt?: string;
  /** Demo-only knob: seed a multi-step status history (e.g. Wishlist ->
   * Applied -> Technical Interview -> Rejected) instead of a single jump
   * from Wishlist to the current status, so the funnel chart has
   * applications that reached a stage before being rejected. */
  statusHistory?: { status: string; date: string }[];
};

type SeedData = {
  companies?: SeedCompany[];
  contacts: SeedContact[];
  applications: SeedApplication[];
};

const localPath = path.join(process.cwd(), "prisma", "seed.local.json");
const examplePath = path.join(process.cwd(), "prisma", "seed.example.json");
const seedPath = existsSync(localPath) ? localPath : examplePath;

console.log(`Seeding from ${path.basename(seedPath)}`);
const data: SeedData = JSON.parse(readFileSync(seedPath, "utf-8"));

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Reseeding is destructive by design — see README's "seed data" section.
  await prisma.event.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  const companyIdByLowerName = new Map<string, string>();
  for (const c of data.companies ?? []) {
    const created = await prisma.company.create({
      data: {
        name: c.name,
        website: c.website,
        portalUsername: c.portalUsername,
        portalPassword: c.portalPassword,
        notes: c.notes,
      },
    });
    companyIdByLowerName.set(c.name.toLowerCase(), created.id);
  }

  async function resolveCompanyId(name: string): Promise<string> {
    const key = name.trim().toLowerCase();
    const existing = companyIdByLowerName.get(key);
    if (existing) return existing;
    const created = await prisma.company.create({
      data: { name: name.trim() },
    });
    companyIdByLowerName.set(key, created.id);
    return created.id;
  }

  const contactIdByName = new Map<string, string>();
  for (const c of data.contacts) {
    const created = await prisma.contact.create({
      data: {
        name: c.name,
        company: c.company,
        role: c.role,
        relationship: c.relationship,
        howWeMet: c.howWeMet,
        email: c.email,
        linkedinUrl: c.linkedinUrl,
        nextStep: c.nextStep,
        notes: c.notes,
      },
    });
    contactIdByName.set(c.name, created.id);
  }

  for (const a of data.applications) {
    const companyId = await resolveCompanyId(a.companyName);
    const dateApplied = parseLocalDateInput(a.dateApplied);
    const explicitFollowUp = parseLocalDateInput(a.followUpDate);
    const followUpDate =
      explicitFollowUp ??
      computeAutoFollowUpDate(
        a.status as Status,
        null,
        dateApplied ?? new Date(),
      ) ??
      undefined;

    const created = await prisma.application.create({
      data: {
        companyId,
        roleTitle: a.roleTitle,
        team: a.team,
        location: a.location,
        jobUrl: a.jobUrl,
        reqId: a.reqId,
        source: a.source,
        resumeVersion: a.resumeVersion,
        tier: a.tier,
        status: a.status,
        dateApplied,
        deadline: parseLocalDateInput(a.deadline),
        followUpDate,
        nextInterviewDate: parseLocalDateInput(a.nextInterviewDate),
        itarRestricted: a.itarRestricted ?? false,
        compensation: a.compensation,
        notes: a.notes,
        referralId: a.referralContactName
          ? contactIdByName.get(a.referralContactName)
          : undefined,
        ...(a.updatedAt ? { updatedAt: parseLocalDateInput(a.updatedAt) } : {}),
      },
    });

    if (a.statusHistory && a.statusHistory.length > 0) {
      let previousStatus: Status = "Wishlist";
      for (const step of a.statusHistory) {
        const event = buildStatusChangeEvent(
          previousStatus,
          step.status as Status,
          parseLocalDateInput(step.date) ?? created.createdAt,
        );
        await prisma.event.create({
          data: { applicationId: created.id, ...event },
        });
        previousStatus = step.status as Status;
      }
    } else if (a.status !== "Wishlist") {
      const event = buildStatusChangeEvent(
        "Wishlist",
        a.status as Status,
        dateApplied ?? created.createdAt,
      );
      await prisma.event.create({
        data: { applicationId: created.id, ...event },
      });
    }
  }

  console.log(
    `Seeded ${companyIdByLowerName.size} companies, ${data.contacts.length} contacts, and ${data.applications.length} applications.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
