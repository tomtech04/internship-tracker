"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createContact, updateContact } from "@/actions/contacts";
import { Button } from "@/components/common/button";
import { Field, fieldClass } from "@/components/common/form-fields";
import { RELATIONSHIPS } from "@/lib/constants";

import {
  EMPTY_CONTACT_FORM_VALUES,
  type ContactFormValues,
} from "./contact-form-values";

// Re-exported for convenience for other CLIENT components — but never
// import contactToFormValues from here in a Server Component: every export
// of a "use client" file is a client-only reference, even a plain
// function. Server Components must import it straight from
// "./contact-form-values" instead.
export type { ContactFormValues } from "./contact-form-values";

export function ContactForm({
  mode,
  contactId,
  initialValues,
  applications,
  compact,
  onCreated,
}: {
  mode: "create" | "edit";
  contactId?: string;
  initialValues?: ContactFormValues;
  applications: { id: string; company: string; roleTitle: string }[];
  /** Hides the "Linked applications" section — used when this form is
   * embedded inline (e.g. quick-adding a referral from the application
   * form), where there's nothing meaningful to link yet. */
  compact?: boolean;
  /** Used by the inline "+ New" flow on the application form — skips the
   * redirect and hands the new contact straight back instead. */
  onCreated?: (contact: { id: string; name: string }) => void;
}) {
  const [values, setValues] = useState<ContactFormValues>(
    initialValues ?? EMPTY_CONTACT_FORM_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleApplication(id: string) {
    setValues((v) => ({
      ...v,
      applicationIds: v.applicationIds.includes(id)
        ? v.applicationIds.filter((a) => a !== id)
        : [...v.applicationIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createContact(values)
          : await updateContact(contactId!, values);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (mode === "create") {
        if (onCreated) {
          onCreated({ id: result.data.id, name: values.name.trim() });
        } else {
          router.push(`/contacts/${result.data.id}`);
        }
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
        <p className="bg-danger/10 text-danger rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
          Basics
        </legend>
        <Field
          label="Name"
          htmlFor="name"
          required
          error={fieldErrors.name?.[0]}
        >
          <input
            id="name"
            className={fieldClass}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Relationship" htmlFor="relationship">
          <select
            id="relationship"
            className={fieldClass}
            value={values.relationship}
            onChange={(e) => set("relationship", e.target.value)}
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company" htmlFor="company">
          <input
            id="company"
            className={fieldClass}
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>
        <Field label="Role" htmlFor="role">
          <input
            id="role"
            className={fieldClass}
            value={values.role}
            onChange={(e) => set("role", e.target.value)}
          />
        </Field>
        <Field label="How we met" htmlFor="howWeMet">
          <input
            id="howWeMet"
            className={fieldClass}
            value={values.howWeMet}
            onChange={(e) => set("howWeMet", e.target.value)}
          />
        </Field>
        <Field label="Last contacted" htmlFor="lastContactedDate">
          <input
            id="lastContactedDate"
            type="date"
            className={fieldClass}
            value={values.lastContactedDate}
            onChange={(e) => set("lastContactedDate", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="text-foreground col-span-full mb-1 text-sm font-semibold">
          Contact info
        </legend>
        <Field label="Email" htmlFor="email" error={fieldErrors.email?.[0]}>
          <input
            id="email"
            type="email"
            className={fieldClass}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field
          label="LinkedIn URL"
          htmlFor="linkedinUrl"
          error={fieldErrors.linkedinUrl?.[0]}
        >
          <input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/..."
            className={fieldClass}
            value={values.linkedinUrl}
            onChange={(e) => set("linkedinUrl", e.target.value)}
          />
        </Field>
        <Field
          label="Next step"
          htmlFor="nextStep"
          hint="e.g. 'Ask for a referral', 'Send thank-you note'"
        >
          <input
            id="nextStep"
            className={fieldClass}
            value={values.nextStep}
            onChange={(e) => set("nextStep", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 text-sm font-semibold">
          Notes
        </legend>
        <Field label="Notes" htmlFor="notes">
          <textarea
            id="notes"
            rows={4}
            className={fieldClass}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </fieldset>

      {!compact && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-foreground mb-1 text-sm font-semibold">
            Linked applications
          </legend>
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No applications to link yet.
            </p>
          ) : (
            <div className="border-border flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {applications.map((app) => (
                <label
                  key={app.id}
                  className="hover:bg-muted flex items-center gap-2 rounded px-1.5 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    className="border-input h-4 w-4 rounded"
                    checked={values.applicationIds.includes(app.id)}
                    onChange={() => toggleApplication(app.id)}
                  />
                  <span className="text-foreground">{app.company}</span>
                  <span className="text-muted-foreground">
                    — {app.roleTitle}
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create contact"
              : "Save changes"}
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
