import { z } from "zod";

const isoDate = z.coerce.date();
const isoDateNullable = z
  .union([z.coerce.date(), z.null()])
  .transform((v) => v ?? null);

export const backupContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().nullable(),
  role: z.string().nullable(),
  relationship: z.string(),
  howWeMet: z.string().nullable(),
  email: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  lastContactedDate: isoDateNullable,
  nextStep: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const backupApplicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  roleTitle: z.string(),
  team: z.string().nullable(),
  location: z.string().nullable(),
  jobUrl: z.string().nullable(),
  reqId: z.string().nullable(),
  source: z.string(),
  resumeVersion: z.string(),
  tier: z.string(),
  status: z.string(),
  dateApplied: isoDateNullable,
  deadline: isoDateNullable,
  followUpDate: isoDateNullable,
  nextInterviewDate: isoDateNullable,
  referralId: z.string().nullable(),
  itarRestricted: z.boolean(),
  compensation: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const backupEventSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  type: z.string(),
  date: isoDate,
  description: z.string(),
  createdAt: isoDate,
});

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  contacts: z.array(backupContactSchema),
  applications: z.array(backupApplicationSchema),
  events: z.array(backupEventSchema),
});

export type Backup = z.infer<typeof backupSchema>;
export type BackupContact = z.infer<typeof backupContactSchema>;
export type BackupApplication = z.infer<typeof backupApplicationSchema>;
export type BackupEvent = z.infer<typeof backupEventSchema>;
