// Plain data mapping — deliberately NOT in contact-form.tsx, which has
// "use client" at the top. Every export of a "use client" file becomes a
// client-only reference from the server's perspective (even plain
// functions with no browser dependency), so Server Components can't call
// contactToFormValues() directly if it lived there.
import { formatDateInput } from "@/lib/dates";

export type ContactFormValues = {
  name: string;
  company: string;
  role: string;
  relationship: string;
  howWeMet: string;
  email: string;
  linkedinUrl: string;
  lastContactedDate: string;
  nextStep: string;
  notes: string;
  applicationIds: string[];
};

export const EMPTY_CONTACT_FORM_VALUES: ContactFormValues = {
  name: "",
  company: "",
  role: "",
  relationship: "Friend",
  howWeMet: "",
  email: "",
  linkedinUrl: "",
  lastContactedDate: "",
  nextStep: "",
  notes: "",
  applicationIds: [],
};

export function contactToFormValues(contact: {
  name: string;
  company: string | null;
  role: string | null;
  relationship: string;
  howWeMet: string | null;
  email: string | null;
  linkedinUrl: string | null;
  lastContactedDate: Date | null;
  nextStep: string | null;
  notes: string | null;
  applications: { id: string }[];
}): ContactFormValues {
  return {
    name: contact.name,
    company: contact.company ?? "",
    role: contact.role ?? "",
    relationship: contact.relationship,
    howWeMet: contact.howWeMet ?? "",
    email: contact.email ?? "",
    linkedinUrl: contact.linkedinUrl ?? "",
    lastContactedDate: formatDateInput(contact.lastContactedDate),
    nextStep: contact.nextStep ?? "",
    notes: contact.notes ?? "",
    applicationIds: contact.applications.map((a) => a.id),
  };
}
