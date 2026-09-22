"use server";

import { revalidatePath } from "next/cache";

import { backupSchema } from "@/lib/backup";
import type { CoercedImportRow } from "@/lib/csv";
import { prisma } from "@/lib/db";
import { applicationSchema } from "@/lib/validation";

import type { ActionResult } from "./applications";

function revalidateEverything() {
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/table");
  revalidatePath("/contacts");
}

/**
 * Restores the entire database from a full JSON backup produced by the
 * export feature. This REPLACES all current data — every existing
 * application, contact, and event is deleted first. IDs are preserved
 * as-is from the backup, so relationships (referrals, event ownership)
 * don't need remapping.
 */
export async function restoreFromBackup(
  raw: unknown,
): Promise<ActionResult<{ contacts: number; applications: number; events: number }>> {
  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "That file doesn't look like a valid backup export.",
    };
  }
  const { contacts, applications, events } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.event.deleteMany();
    await tx.application.deleteMany();
    await tx.contact.deleteMany();

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
      contacts: contacts.length,
      applications: applications.length,
      events: events.length,
    },
  };
}

/**
 * Bulk-creates applications from a mapped CSV import. Unlike a JSON
 * restore, this is additive — it appends new applications and never
 * deletes existing data. Rows that fail validation are skipped and
 * reported back rather than aborting the whole import.
 */
export async function importApplicationsCSV(
  rows: CoercedImportRow[],
): Promise<ActionResult<{ created: number; errors: string[] }>> {
  const errors: string[] = [];
  const valid: CoercedImportRow[] = [];

  rows.forEach((row, index) => {
    const parsed = applicationSchema.safeParse(row);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      errors.push(`Row ${index + 1}: ${firstIssue?.message ?? "invalid data"}`);
      return;
    }
    valid.push(row);
  });

  if (valid.length) {
    await prisma.application.createMany({ data: valid });
  }

  revalidateEverything();
  return { success: true, data: { created: valid.length, errors } };
}
