"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createApplication, updateApplication } from "@/actions/applications";
import { findOrCreateCompanyByName } from "@/actions/companies";
import { Button } from "@/components/common/button";
import { Field, fieldClass } from "@/components/common/form-fields";
import { PasteFromClaudeSection } from "@/components/common/paste-from-claude";
import { QuickAddCompanyModal } from "@/components/companies/quick-add-company-modal";
import { QuickAddContactModal } from "@/components/contacts/quick-add-contact-modal";
import { RESUME_VERSIONS, SOURCES, STATUSES, TIERS } from "@/lib/constants";
import type { ParsedAutofillFields } from "@/lib/autofill";

import {
  EMPTY_APPLICATION_FORM_VALUES,
  type ApplicationFormValues,
} from "./application-form-values";

// Re-exported for convenience for other CLIENT components — but never
// import applicationToFormValues from here in a Server Component: every
// export of a "use client" file is a client-only reference, even a plain
// function. Server Components must import it straight from
// "./application-form-values" instead (see page.tsx for both examples).
export type { ApplicationFormValues } from "./application-form-values";

export function ApplicationForm({
  mode,
  applicationId,
  initialValues,
  defaultCompanyId,
  companies,
  contacts,
}: {
  mode: "create" | "edit";
  applicationId?: string;
  initialValues?: ApplicationFormValues;
  /** Pre-selects a company (e.g. arriving from that company's own page via
   * ?companyId=...) — ignored once initialValues (edit mode) is set. */
  defaultCompanyId?: string;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string; company: string | null }[];
}) {
  const [values, setValues] = useState<ApplicationFormValues>(
    initialValues ?? {
      ...EMPTY_APPLICATION_FORM_VALUES,
      companyId: defaultCompanyId ?? "",
    },
  );
  const [companyOptions, setCompanyOptions] = useState(companies);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [contactOptions, setContactOptions] = useState(contacts);
  const [showNewContact, setShowNewContact] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleAutofillParsed(parsed: ParsedAutofillFields) {
    setValues((v) => ({
      ...v,
      ...(parsed.roleTitle ? { roleTitle: parsed.roleTitle } : {}),
      ...(parsed.team ? { team: parsed.team } : {}),
      ...(parsed.location ? { location: parsed.location } : {}),
      ...(parsed.jobUrl ? { jobUrl: parsed.jobUrl } : {}),
      ...(parsed.reqId ? { reqId: parsed.reqId } : {}),
      ...(parsed.source ? { source: parsed.source } : {}),
      ...(parsed.resumeVersion ? { resumeVersion: parsed.resumeVersion } : {}),
      ...(parsed.tier ? { tier: parsed.tier } : {}),
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.dateApplied ? { dateApplied: parsed.dateApplied } : {}),
      ...(parsed.deadline ? { deadline: parsed.deadline } : {}),
      ...(parsed.compensation ? { compensation: parsed.compensation } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    }));

    if (parsed.companyName) {
      const companyId = await findOrCreateCompanyByName(parsed.companyName);
      setCompanyOptions((prev) =>
        prev.some((c) => c.id === companyId)
          ? prev
          : [...prev, { id: companyId, name: parsed.companyName! }].sort(
              (a, b) => a.name.localeCompare(b.name),
            ),
      );
      setValues((v) => ({ ...v, companyId }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createApplication(values)
          : await updateApplication(applicationId!, values);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (mode === "create") {
        router.push(`/applications/${result.data.id}`);
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <p className="bg-danger/10 text-danger rounded-md px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <PasteFromClaudeSection onParsed={handleAutofillParsed} />

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
            Basics
          </legend>
          <Field
            label="Company"
            htmlFor="companyId"
            required
            error={fieldErrors.companyId?.[0]}
          >
            <div className="flex gap-2">
              <select
                id="companyId"
                className={fieldClass}
                value={values.companyId}
                onChange={(e) => set("companyId", e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a company…
                </option>
                {companyOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowNewCompany(true)}
                className="shrink-0"
              >
                <Plus size={14} />
                New
              </Button>
            </div>
            {values.companyId && (
              <Link
                href={`/companies/${values.companyId}`}
                className="text-muted-foreground hover:text-primary text-xs hover:underline"
              >
                Manage this company&apos;s portal login →
              </Link>
            )}
          </Field>
          <Field
            label="Role title"
            htmlFor="roleTitle"
            required
            error={fieldErrors.roleTitle?.[0]}
          >
            <input
              id="roleTitle"
              className={fieldClass}
              value={values.roleTitle}
              onChange={(e) => set("roleTitle", e.target.value)}
              required
            />
          </Field>
          <Field label="Team" htmlFor="team" error={fieldErrors.team?.[0]}>
            <input
              id="team"
              className={fieldClass}
              value={values.team}
              onChange={(e) => set("team", e.target.value)}
            />
          </Field>
          <Field
            label="Location"
            htmlFor="location"
            error={fieldErrors.location?.[0]}
          >
            <input
              id="location"
              className={fieldClass}
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field
            label="Job URL"
            htmlFor="jobUrl"
            error={fieldErrors.jobUrl?.[0]}
          >
            <input
              id="jobUrl"
              type="url"
              placeholder="https://..."
              className={fieldClass}
              value={values.jobUrl}
              onChange={(e) => set("jobUrl", e.target.value)}
            />
          </Field>
          <Field label="Req ID" htmlFor="reqId" error={fieldErrors.reqId?.[0]}>
            <input
              id="reqId"
              className={fieldClass}
              value={values.reqId}
              onChange={(e) => set("reqId", e.target.value)}
            />
          </Field>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
            Classification
          </legend>
          <Field label="Source" htmlFor="source">
            <select
              id="source"
              className={fieldClass}
              value={values.source}
              onChange={(e) => set("source", e.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Resume version" htmlFor="resumeVersion">
            <select
              id="resumeVersion"
              className={fieldClass}
              value={values.resumeVersion}
              onChange={(e) => set("resumeVersion", e.target.value)}
            >
              {RESUME_VERSIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tier" htmlFor="tier">
            <select
              id="tier"
              className={fieldClass}
              value={values.tier}
              onChange={(e) => set("tier", e.target.value)}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              className={fieldClass}
              value={values.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
            Dates
          </legend>
          <Field label="Date applied" htmlFor="dateApplied">
            <input
              id="dateApplied"
              type="date"
              className={fieldClass}
              value={values.dateApplied}
              onChange={(e) => set("dateApplied", e.target.value)}
            />
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <input
              id="deadline"
              type="date"
              className={fieldClass}
              value={values.deadline}
              onChange={(e) => set("deadline", e.target.value)}
            />
          </Field>
          <Field
            label="Follow-up date"
            htmlFor="followUpDate"
            hint="Auto-set 14 days out when status becomes Applied, if left empty."
          >
            <input
              id="followUpDate"
              type="date"
              className={fieldClass}
              value={values.followUpDate}
              onChange={(e) => set("followUpDate", e.target.value)}
            />
          </Field>
          <Field label="Next interview date" htmlFor="nextInterviewDate">
            <input
              id="nextInterviewDate"
              type="date"
              className={fieldClass}
              value={values.nextInterviewDate}
              onChange={(e) => set("nextInterviewDate", e.target.value)}
            />
          </Field>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
            Referral &amp; compensation
          </legend>
          <Field label="Referral contact" htmlFor="referralId">
            <div className="flex gap-2">
              <select
                id="referralId"
                className={fieldClass}
                value={values.referralId}
                onChange={(e) => set("referralId", e.target.value)}
              >
                <option value="">None</option>
                {contactOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` (${c.company})` : ""}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowNewContact(true)}
                className="shrink-0"
              >
                <Plus size={14} />
                New
              </Button>
            </div>
          </Field>
          <Field label="Compensation" htmlFor="compensation">
            <input
              id="compensation"
              placeholder="$45/hr + housing stipend"
              className={fieldClass}
              value={values.compensation}
              onChange={(e) => set("compensation", e.target.value)}
            />
          </Field>
          <label className="text-foreground flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={values.itarRestricted}
              onChange={(e) => set("itarRestricted", e.target.checked)}
              className="border-input h-4 w-4 rounded"
            />
            ITAR restricted (US-persons only role)
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-foreground mb-1 text-sm font-semibold">
            Notes
          </legend>
          <Field label="Notes (Markdown supported)" htmlFor="notes">
            <textarea
              id="notes"
              rows={6}
              className={fieldClass}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </fieldset>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Create application"
                : "Save changes"}
          </Button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Saved ✓
            </span>
          )}
        </div>
      </form>

      <QuickAddCompanyModal
        open={showNewCompany}
        onClose={() => setShowNewCompany(false)}
        onCreated={(company) => {
          setCompanyOptions((prev) =>
            [...prev, company].sort((a, b) => a.name.localeCompare(b.name)),
          );
          set("companyId", company.id);
        }}
      />

      <QuickAddContactModal
        open={showNewContact}
        onClose={() => setShowNewContact(false)}
        onCreated={(contact) => {
          setContactOptions((prev) =>
            [...prev, { ...contact, company: null }].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          );
          set("referralId", contact.id);
        }}
      />
    </>
  );
}
