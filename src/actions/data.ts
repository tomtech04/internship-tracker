"use server";

import { revalidatePath } from "next/cache";

import { findOrCreateCompanyByName } from "@/actions/companies";
import { backupSchema } from "@/lib/backup";
import type { CoercedImportRow } from "@/lib/csv";
import { prisma } from "@/lib/db";
import { applicationSchema, type ApplicationInput } from "@/lib/validation";

import type { ActionResult } from "./applications";

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/table");
  revalidatePath("/contacts");
  revalidatePath("/companies");
}

/**
 * Restores the entire database from a full JSON backup produced by the
 * export feature. This REPLACES all current data — every existing
 * company, application, contact, and event is deleted first. IDs are
 * preserved as-is from the backup, so relationships (referrals, company
 * ownership, event ownership) don't need remapping.
 */
export async function restoreFromBackup(raw: unknown): Promise<
  ActionResult<{
    companies: number;
    contacts: number;
    applications: number;
    events: number;
  }>
> {
  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "That file doesn't look like a valid backup export.",
    };
  }
  const { companies, contacts, applications, events } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.event.deleteMany();
    await tx.application.deleteMany();
    await tx.contact.deleteMany();
    await tx.company.deleteMany();

    if (companies.length) {
      await tx.company.createMany({ data: companies });
    }
    if (contacts.length) {
      await tx.contact.createMany({ data: contacts });
    }
    if (applications.length) {
      await tx.application.createMany({ data: applications });
    }
    if (events.length) {
      await tx.event.createMany({ data: events });
    }
  });

  revalidateEverything();
  return {
    success: true,
    data: {
      companies: companies.length,
      contacts: contacts.length,
      applications: applications.length,
      events: events.length,
    },
  };
}

/**
 * Bulk-creates applications from a mapped CSV import. Unlike a JSON
 * restore, this is additive — it appends new applications (and companies,
 * as needed) and never deletes existing data. Rows that fail validation
 * are skipped and reported back rather than aborting the whole import.
 */
export async function importApplicationsCSV(
  rows: CoercedImportRow[],
): Promise<ActionResult<{ created: number; errors: string[] }>> {
  const errors: string[] = [];
  const toCreate: ApplicationInput[] = [];
  const companyIdByLowerName = new Map<string, string>();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const companyName = row.companyName.trim();
    if (!companyName) {
      errors.push(`Row ${index + 1}: Company is required`);
      continue;
    }

    const key = companyName.toLowerCase();
    let companyId = companyIdByLowerName.get(key);
    if (!companyId) {
      companyId = await findOrCreateCompanyByName(companyName);
      companyIdByLowerName.set(key, companyId);
    }

    const parsed = applicationSchema.safeParse({ ...row, companyId });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      errors.push(`Row ${index + 1}: ${firstIssue?.message ?? "invalid data"}`);
      continue;
    }
    toCreate.push(parsed.data);
  }

  if (toCreate.length) {
    await prisma.application.createMany({ data: toCreate });
  }

  revalidateEverything();
  return { success: true, data: { created: toCreate.length, errors } };
}
