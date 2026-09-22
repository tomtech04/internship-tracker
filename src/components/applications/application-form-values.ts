// Plain data mapping — deliberately NOT in application-form.tsx, which has
// "use client" at the top. Every export of a "use client" file becomes a
// client-only reference from the server's perspective (even plain
// functions with no browser dependency), so Server Components can't call
// applicationToFormValues() directly if it lived there.
import { formatDateInput } from "@/lib/dates";

export type ApplicationFormValues = {
  company: string;
  roleTitle: string;
  team: string;
  location: string;
  jobUrl: string;
  reqId: string;
  source: string;
  resumeVersion: string;
  tier: string;
  status: string;
  dateApplied: string;
  deadline: string;
  followUpDate: string;
  nextInterviewDate: string;
  referralId: string;
  itarRestricted: boolean;
  compensation: string;
  applicationEmail: string;
  notes: string;
};

export const EMPTY_APPLICATION_FORM_VALUES: ApplicationFormValues = {
  company: "",
  roleTitle: "",
  team: "",
  location: "",
  jobUrl: "",
  reqId: "",
  source: "Company Site",
  resumeVersion: "Space",
  tier: "Target",
  status: "Wishlist",
  dateApplied: "",
  deadline: "",
  followUpDate: "",
  nextInterviewDate: "",
  referralId: "",
  itarRestricted: false,
  compensation: "",
  applicationEmail: "",
  notes: "",
};

export function applicationToFormValues(app: {
  company: string;
  roleTitle: string;
  team: string | null;
  location: string | null;
  jobUrl: string | null;
  reqId: string | null;
  source: string;
  resumeVersion: string;
  tier: string;
  status: string;
  dateApplied: Date | null;
  deadline: Date | null;
  followUpDate: Date | null;
  nextInterviewDate: Date | null;
  referralId: string | null;
  itarRestricted: boolean;
  compensation: string | null;
  applicationEmail: string | null;
  notes: string | null;
}): ApplicationFormValues {
  return {
    company: app.company,
    roleTitle: app.roleTitle,
    team: app.team ?? "",
    location: app.location ?? "",
    jobUrl: app.jobUrl ?? "",
    reqId: app.reqId ?? "",
    source: app.source,
    resumeVersion: app.resumeVersion,
    tier: app.tier,
    status: app.status,
    dateApplied: formatDateInput(app.dateApplied),
    deadline: formatDateInput(app.deadline),
    followUpDate: formatDateInput(app.followUpDate),
    nextInterviewDate: formatDateInput(app.nextInterviewDate),
    referralId: app.referralId ?? "",
    itarRestricted: app.itarRestricted,
    compensation: app.compensation ?? "",
    applicationEmail: app.applicationEmail ?? "",
    notes: app.notes ?? "",
  };
}
