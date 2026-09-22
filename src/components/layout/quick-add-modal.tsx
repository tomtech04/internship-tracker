"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { quickAddApplication } from "@/actions/applications";
import { Button } from "@/components/common/button";
import { Field, fieldClass } from "@/components/common/form-fields";
import { Modal } from "@/components/common/modal";
import { PasteFromClaudeSection } from "@/components/common/paste-from-claude";
import { RESUME_VERSIONS, STATUSES } from "@/lib/constants";
import type { ParsedAutofillFields } from "@/lib/autofill";

const EMPTY = {
  companyName: "",
  roleTitle: "",
  jobUrl: "",
  resumeVersion: "Space" as (typeof RESUME_VERSIONS)[number],
  status: "Wishlist" as (typeof STATUSES)[number],
};

export function QuickAddModal({
  open,
  onClose,
  companies,
}: {
  open: boolean;
  onClose: () => void;
  companies: { id: string; name: string }[];
}) {
  const [values, setValues] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [wasOpen, setWasOpen] = useState(open);
  const companyRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset the form's state during render when `open` flips to true, rather
  // than in an effect — this avoids an extra render pass, and mirroring the
  // previous prop is React's documented pattern for this ("Adjusting some
  // state when a prop changes").
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(EMPTY);
      setFieldErrors({});
      setError(null);
      setJustAdded(false);
    }
  }

  // Focusing an element is a real side effect (imperative DOM API), so it
  // stays in an effect rather than the render-time reset above.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => companyRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  function handleAutofillParsed(parsed: ParsedAutofillFields) {
    setValues((v) => ({
      ...v,
      ...(parsed.companyName ? { companyName: parsed.companyName } : {}),
      ...(parsed.roleTitle ? { roleTitle: parsed.roleTitle } : {}),
      ...(parsed.jobUrl ? { jobUrl: parsed.jobUrl } : {}),
      ...(parsed.resumeVersion ? { resumeVersion: parsed.resumeVersion } : {}),
      ...(parsed.status ? { status: parsed.status } : {}),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await quickAddApplication(values);
      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setJustAdded(true);
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 700);
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick add application">
      {justAdded ? (
        <p className="text-foreground py-6 text-center text-sm font-medium">
          ✅ Added! Open its detail page later to fill in the rest.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <PasteFromClaudeSection onParsed={handleAutofillParsed} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && <p className="text-danger text-sm">{error}</p>}
            <Field
              label="Company"
              htmlFor="qa-company"
              required
              error={fieldErrors.companyName?.[0]}
              hint="Pick an existing one or type a new name — add portal login details later from Companies."
            >
              <input
                ref={companyRef}
                id="qa-company"
                list="qa-company-options"
                className={fieldClass}
                value={values.companyName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, companyName: e.target.value }))
                }
                autoComplete="off"
                required
              />
              <datalist id="qa-company-options">
                {companies.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </Field>
            <Field
              label="Role title"
              htmlFor="qa-role"
              required
              error={fieldErrors.roleTitle?.[0]}
            >
              <input
                id="qa-role"
                className={fieldClass}
                value={values.roleTitle}
                onChange={(e) =>
                  setValues((v) => ({ ...v, roleTitle: e.target.value }))
                }
                required
              />
            </Field>
            <Field
              label="Job URL"
              htmlFor="qa-url"
              error={fieldErrors.jobUrl?.[0]}
            >
              <input
                id="qa-url"
                type="url"
                placeholder="https://..."
                className={fieldClass}
                value={values.jobUrl}
                onChange={(e) =>
                  setValues((v) => ({ ...v, jobUrl: e.target.value }))
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Resume version" htmlFor="qa-resume">
                <select
                  id="qa-resume"
                  className={fieldClass}
                  value={values.resumeVersion}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      resumeVersion: e.target.value as typeof v.resumeVersion,
                    }))
                  }
                >
                  {RESUME_VERSIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="qa-status">
                <select
                  id="qa-status"
                  className={fieldClass}
                  value={values.status}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      status: e.target.value as typeof v.status,
                    }))
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding…" : "Add application"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
