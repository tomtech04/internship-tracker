"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

import type { ActionResult } from "./applications";

function revalidateContactPaths(id?: string) {
  revalidatePath("/contacts");
  revalidatePath("/");
  revalidatePath("/table");
  if (id) revalidatePath(`/contacts/${id}`);
}

export async function createContact(
  input: unknown,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { applicationIds, ...data } = parsed.data;

  const created = await prisma.contact.create({
    data: {
      ...data,
      applications: applicationIds.length
        ? { connect: applicationIds.map((id) => ({ id })) }
        : undefined,
    },
  });

  revalidateContactPaths(created.id);
  return { success: true, data: { id: created.id } };
}

export async function updateContact(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { applicationIds, ...data } = parsed.data;

  await prisma.contact.update({
    where: { id },
    data: {
      ...data,
      applications: { set: applicationIds.map((id) => ({ id })) },
    },
  });

  revalidateContactPaths(id);
  return { success: true, data: { id } };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  await prisma.contact.delete({ where: { id } });
  revalidateContactPaths();
  return { success: true, data: { id } };
}
