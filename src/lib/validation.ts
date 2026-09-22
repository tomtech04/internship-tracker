import { z } from "zod";

import {
  EVENT_TYPES,
  RELATIONSHIPS,
  RESUME_VERSIONS,
  SOURCES,
  STATUSES,
  TIERS,
} from "@/lib/constants";
import { parseLocalDateInput } from "@/lib/dates";

/** Empty-string form fields should be treated as "not provided". */
const optionalString = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

/** Calendar-day fields (from <input type="date">) — see src/lib/dates.ts
 * for why these can't use z.coerce.date() directly. */
const optionalDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((v) => parseLocalDateInput(v));

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\//i.test(v), {
    message: "URL must start with http:// or https://",
  });

const optionalEmail = z
  .string()
  .trim()
  .max(320)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
    message: "Must be a valid email",
  });

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  roleTitle: z.string().trim().min(1, "Role title is required").max(200),
  team: optionalString,
  location: optionalString,
  jobUrl: optionalUrl,
  reqId: optionalString,
  source: z.enum(SOURCES),
  resumeVersion: z.enum(RESUME_VERSIONS),
  tier: z.enum(TIERS),
  status: z.enum(STATUSES),
  dateApplied: optionalDate,
  deadline: optionalDate,
  followUpDate: optionalDate,
  nextInterviewDate: optionalDate,
  referralId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  itarRestricted: z.coerce.boolean().default(false),
  compensation: optionalString,
  notes: optionalString,
  applicationEmail: optionalEmail,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const quickAddSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  roleTitle: z.string().trim().min(1, "Role title is required").max(200),
  jobUrl: optionalUrl,
  resumeVersion: z.enum(RESUME_VERSIONS),
  status: z.enum(STATUSES),
});

export type QuickAddInput = z.infer<typeof quickAddSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  company: optionalString,
  role: optionalString,
  relationship: z.enum(RELATIONSHIPS),
  howWeMet: optionalString,
  email: optionalEmail,
  linkedinUrl: optionalUrl,
  lastContactedDate: optionalDate,
  nextStep: optionalString,
  notes: optionalString,
  applicationIds: z.array(z.string()).optional().default([]),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const manualEventSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(EVENT_TYPES),
  date: z
    .union([z.string(), z.date(), z.null(), z.undefined()])
    .transform((v) => parseLocalDateInput(v)),
  description: z.string().trim().min(1, "Description is required").max(4000),
});

export type ManualEventInput = z.infer<typeof manualEventSchema>;

export const statusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(STATUSES),
});
