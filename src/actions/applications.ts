"use server";

import { revalidatePath } from "next/cache";

import { findOrCreateCompanyByName } from "@/actions/companies";
import {
  buildStatusChangeEvent,
  computeAutoFollowUpDate,
} from "@/lib/application-logic";
import type { Status } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { applicationSchema, quickAddSchema } from "@/lib/validation";

export type ActionResult<T = { id: string }> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidateApplicationPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/table");
  if (id) revalidatePath(`/applications/${id}`);
}

export async function createApplication(input: unknown): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const autoFollowUp = computeAutoFollowUpDate(
    data.status,
    data.followUpDate ?? null,
  );

  const created = await prisma.application.create({
    data: {
      ...data,
      followUpDate: data.followUpDate ?? autoFollowUp,
    },
  });

  revalidateApplicationPaths(created.id);
  return { success: true, data: { id: created.id } };
}

export async function quickAddApplication(
  input: unknown,
): Promise<ActionResult> {
  const parsed = quickAddSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const autoFollowUp = computeAutoFollowUpDate(data.status, null);
  const companyId = await findOrCreateCompanyByName(data.companyName);

  const created = await prisma.application.create({
    data: {
      companyId,
      roleTitle: data.roleTitle,
      jobUrl: data.jobUrl,
      resumeVersion: data.resumeVersion,
      status: data.status,
      source: "Other",
      tier: "Target",
      followUpDate: autoFollowUp,
    },
  });

  revalidateApplicationPaths(created.id);
  return { success: true, data: { id: created.id } };
}

export async function updateApplication(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const current = await prisma.application.findUnique({ where: { id } });
  if (!current) {
    return { success: false, error: "Application not found." };
  }

  const statusChanged = current.status !== data.status;
  let followUpDate = data.followUpDate ?? null;
  if (statusChanged && data.status === "Applied" && !followUpDate) {
    followUpDate = computeAutoFollowUpDate(data.status, null);
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id },
      data: { ...data, followUpDate },
    });
    if (statusChanged) {
      const event = buildStatusChangeEvent(
        current.status as Status,
        data.status,
      );
      await tx.event.create({
        data: { applicationId: id, ...event },
      });
    }
  });

  revalidateApplicationPaths(id);
  return { success: true, data: { id } };
}

export async function updateApplicationStatus(
  id: string,
  newStatus: Status,
): Promise<ActionResult> {
  const current = await prisma.application.findUnique({ where: { id } });
  if (!current) {
    return { success: false, error: "Application not found." };
  }
  if (current.status === newStatus) {
    return { success: true, data: { id } };
  }

  const autoFollowUp = current.followUpDate
    ? null
    : computeAutoFollowUpDate(newStatus, null);

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id },
      data: {
        status: newStatus,
        ...(autoFollowUp ? { followUpDate: autoFollowUp } : {}),
      },
    });
    const event = buildStatusChangeEvent(current.status as Status, newStatus);
    await tx.event.create({ data: { applicationId: id, ...event } });
  });

  revalidateApplicationPaths(id);
  return { success: true, data: { id } };
}

export async function markAsGhosted(id: string): Promise<ActionResult> {
  return updateApplicationStatus(id, "Ghosted");
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  await prisma.application.delete({ where: { id } });
  revalidateApplicationPaths();
  revalidatePath("/contacts");
  return { success: true, data: { id } };
}
