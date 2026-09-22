"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createApplication, updateApplication } from "@/actions/applications";
import { Button } from "@/components/common/button";
import { Field, fieldClass } from "@/components/common/form-fields";
import { RESUME_VERSIONS, SOURCES, STATUSES, TIERS } from "@/lib/constants";

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
  contacts,
}: {
  mode: "create" | "edit";
  applicationId?: string;
  initialValues?: ApplicationFormValues;
  contacts: { id: string; name: string; company: string | null }[];
}) {
  const [values, setValues] = useState<ApplicationFormValues>(
    initialValues ?? EMPTY_APPLICATION_FORM_VALUES,
  );
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">
          Basics
        </legend>
        <Field label="Company" htmlFor="company" required error={fieldErrors.company?.[0]}>
          <input
            id="company"
            className={fieldClass}
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            required
          />
        </Field>
        <Field label="Role title" htmlFor="roleTitle" required error={fieldErrors.roleTitle?.[0]}>
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
        <Field label="Location" htmlFor="location" error={fieldErrors.location?.[0]}>
          <input
            id="location"
            className={fieldClass}
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </Field>
        <Field label="Job URL" htmlFor="jobUrl" error={fieldErrors.jobUrl?.[0]}>
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
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">
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
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">
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
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">
          Referral, account &amp; compensation
        </legend>
        <Field label="Referral contact" htmlFor="referralId">
          <select
            id="referralId"
            className={fieldClass}
            value={values.referralId}
            onChange={(e) => set("referralId", e.target.value)}
          >
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
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
        <Field
          label="Email used to apply"
          htmlFor="applicationEmail"
          hint="Which inbox you used to create this company's application portal account."
          error={fieldErrors.applicationEmail?.[0]}
        >
          <input
            id="applicationEmail"
            type="email"
            placeholder="you@school.edu"
            className={fieldClass}
            value={values.applicationEmail}
            onChange={(e) => set("applicationEmail", e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input
            type="checkbox"
            checked={values.itarRestricted}
            onChange={(e) => set("itarRestricted", e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          ITAR restricted (US-persons only role)
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-foreground">
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
          {isPending ? "Saving…" : mode === "create" ? "Create application" : "Save changes"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Saved ✓
          </span>
        )}
      </div>
    </form>
  );
}
