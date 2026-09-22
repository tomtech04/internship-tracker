"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { companySchema } from "@/lib/validation";

import type { ActionResult } from "./applications";

function revalidateCompanyPaths(id?: string) {
  revalidatePath("/companies");
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/table");
  if (id) revalidatePath(`/companies/${id}`);
}

// SQLite has no case-insensitive `mode` filter in Prisma (that's a
// Postgres/MySQL feature), so match case-insensitively in JS instead —
// fine at this scale (dozens of companies, not thousands).
async function findCompanyByNameCaseInsensitive(name: string) {
  const all = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  return all.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
}

export async function createCompany(input: unknown): Promise<ActionResult> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await findCompanyByNameCaseInsensitive(parsed.data.name);
  if (existing) {
    return {
      success: false,
      error: `A company named "${existing.name}" already exists.`,
      fieldErrors: { name: ["Already exists"] },
    };
  }

  const created = await prisma.company.create({ data: parsed.data });
  revalidateCompanyPaths(created.id);
  return { success: true, data: { id: created.id } };
}

export async function updateCompany(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await findCompanyByNameCaseInsensitive(parsed.data.name);
  if (existing && existing.id !== id) {
    return {
      success: false,
      error: `A company named "${existing.name}" already exists.`,
      fieldErrors: { name: ["Already exists"] },
    };
  }

  await prisma.company.update({ where: { id }, data: parsed.data });
  revalidateCompanyPaths(id);
  return { success: true, data: { id } };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  await prisma.company.delete({ where: { id } });
  revalidateCompanyPaths();
  return { success: true, data: { id } };
}

/**
 * Finds a company by exact (case-insensitive) name, or creates a bare new
 * one with just that name. Used by quick add and CSV import, where asking
 * for portal credentials up front would defeat the point of a fast path —
 * those can be filled in later from the company's own page.
 */
export async function findOrCreateCompanyByName(name: string): Promise<string> {
  const existing = await findCompanyByNameCaseInsensitive(name);
  if (existing) return existing.id;

  const created = await prisma.company.create({ data: { name: name.trim() } });
  revalidateCompanyPaths(created.id);
  return created.id;
}
