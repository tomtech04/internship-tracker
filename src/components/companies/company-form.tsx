"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCompany, updateCompany } from "@/actions/companies";
import { Button } from "@/components/common/button";
import { Field, fieldClass } from "@/components/common/form-fields";

import {
  EMPTY_COMPANY_FORM_VALUES,
  type CompanyFormValues,
} from "./company-form-values";

export type { CompanyFormValues } from "./company-form-values";

export function CompanyForm({
  mode,
  companyId,
  initialValues,
  onCreated,
}: {
  mode: "create" | "edit";
  companyId?: string;
  initialValues?: CompanyFormValues;
  /** Used by the inline "+ New company" flow on the application form —
   * skips the redirect and hands the new company straight back instead. */
  onCreated?: (company: { id: string; name: string }) => void;
}) {
  const [values, setValues] = useState<CompanyFormValues>(
    initialValues ?? EMPTY_COMPANY_FORM_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof CompanyFormValues>(
    key: K,
    value: CompanyFormValues[K],
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
          ? await createCompany(values)
          : await updateCompany(companyId!, values);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (mode === "create") {
        if (onCreated) {
          onCreated({ id: result.data.id, name: values.name.trim() });
        } else {
          router.push(`/companies/${result.data.id}`);
        }
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="bg-danger/10 text-danger rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Field
        label="Company name"
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
          autoFocus
        />
      </Field>

      <Field label="Website" htmlFor="website" error={fieldErrors.website?.[0]}>
        <input
          id="website"
          type="url"
          placeholder="https://..."
          className={fieldClass}
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </Field>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
        <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
          Stored in plain text in your local database — this app has no
          encryption layer. Fine for a personal machine, but don&apos;t treat it
          as a real password manager.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Portal username / email" htmlFor="portalUsername">
            <input
              id="portalUsername"
              className={fieldClass}
              value={values.portalUsername}
              onChange={(e) => set("portalUsername", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Portal password" htmlFor="portalPassword">
            <div className="relative">
              <input
                id="portalPassword"
                type={showPassword ? "text" : "password"}
                className={`${fieldClass} pr-9`}
                value={values.portalPassword}
                onChange={(e) => set("portalPassword", e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>
      </div>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          rows={3}
          className={fieldClass}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create company"
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
