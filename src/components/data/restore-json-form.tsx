"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { restoreFromBackup } from "@/actions/data";
import { Button } from "@/components/common/button";
import { fieldClass } from "@/components/common/form-fields";

const CONFIRM_PHRASE = "RESTORE";

export function RestoreJsonForm() {
  const [parsed, setParsed] = useState<{
    contacts: number;
    applications: number;
    events: number;
    raw: unknown;
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setResult(null);
    setParsed(null);
    setConfirmText("");
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || typeof json !== "object") throw new Error("invalid");
      setParsed({
        contacts: Array.isArray(json.contacts) ? json.contacts.length : 0,
        applications: Array.isArray(json.applications)
          ? json.applications.length
          : 0,
        events: Array.isArray(json.events) ? json.events.length : 0,
        raw: json,
      });
    } catch {
      setError("That file isn't valid JSON.");
    }
  }

  function handleRestore() {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      const res = await restoreFromBackup(parsed.raw);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResult(
        `Restored ${res.data.applications} applications, ${res.data.contacts} contacts, and ${res.data.events} timeline events.`,
      );
      setParsed(null);
      setConfirmText("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleFile}
        aria-label="Choose backup JSON file"
        className={fieldClass}
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      {result && (
        <p className="text-sm text-green-600 dark:text-green-400">{result}</p>
      )}

      {parsed && (
        <div className="border-danger/40 bg-danger/5 rounded-md border p-3">
          <p className="text-foreground text-sm font-medium">
            This backup contains {parsed.applications} applications,{" "}
            {parsed.contacts} contacts, and {parsed.events} timeline events.
          </p>
          <p className="text-danger mt-1 text-sm">
            Restoring will permanently delete ALL current data and replace it
            with this backup. This can&apos;t be undone.
          </p>
          <label
            htmlFor="confirm-restore"
            className="text-foreground mt-3 block text-sm font-medium"
          >
            Type {CONFIRM_PHRASE} to confirm
          </label>
          <input
            id="confirm-restore"
            className={`${fieldClass} mt-1 max-w-xs`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <div className="mt-3">
            <Button
              variant="danger"
              disabled={confirmText !== CONFIRM_PHRASE || isPending}
              onClick={handleRestore}
            >
              {isPending ? "Restoring…" : "Restore and replace all data"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
