"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { manualEventSchema, type ManualEventInput } from "@/lib/validation";

import type { ActionResult } from "./applications";

export async function addManualEvent(
  input: ManualEventInput,
): Promise<ActionResult> {
  const parsed = manualEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { applicationId, ...data } = parsed.data;

  const created = await prisma.event.create({
    data: {
      applicationId,
      type: data.type,
      description: data.description,
      date: data.date ?? new Date(),
    },
  });

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/");
  return { success: true, data: { id: created.id } };
}

export async function deleteEvent(
  eventId: string,
  applicationId: string,
): Promise<ActionResult> {
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath(`/applications/${applicationId}`);
  return { success: true, data: { id: eventId } };
}
