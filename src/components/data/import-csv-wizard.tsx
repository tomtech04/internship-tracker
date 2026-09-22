"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import { importApplicationsCSV } from "@/actions/data";
import { Button } from "@/components/common/button";
import { fieldClass } from "@/components/common/form-fields";
import {
  APPLICATION_CSV_FIELDS,
  identityMapping,
  mapCsvRowToApplicationInput,
  parseCSV,
  type ApplicationCsvField,
  type ApplicationImportMapping,
} from "@/lib/csv";

const TARGET_FIELDS = APPLICATION_CSV_FIELDS.filter(
  (f): f is Exclude<ApplicationCsvField, "referralName"> =>
    f !== "referralName",
);

const REQUIRED_FIELDS = new Set<ApplicationCsvField>(["company", "roleTitle"]);

function guessMapping(headers: string[]): ApplicationImportMapping {
  const mapping = identityMapping(headers);
  for (const field of TARGET_FIELDS) {
    if (mapping[field]) continue;
    const match = headers.find(
      (h) => h.trim().toLowerCase() === field.toLowerCase(),
    );
    if (match) mapping[field] = match;
  }
  return mapping;
}

export function ImportCsvWizard() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ApplicationImportMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    created: number;
    errors: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setResult(null);
    if (!file) return;
    const text = await file.text();
    const { headers: h, rows: r } = parseCSV(text);
    if (h.length === 0 || r.length === 0) {
      setError("Couldn't find any rows in that CSV.");
      return;
    }
    setHeaders(h);
    setRows(r);
    setMapping(guessMapping(h));
  }

  const mappedPreview = useMemo(
    () => rows.slice(0, 5).map((row) => mapCsvRowToApplicationInput(row, mapping)),
    [rows, mapping],
  );

  const missingRequired = TARGET_FIELDS.filter(
    (f) => REQUIRED_FIELDS.has(f) && !mapping[f],
  );

  function handleImport() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const coerced = rows.map((row) => mapCsvRowToApplicationInput(row, mapping));
      const res = await importApplicationsCSV(coerced);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      setHeaders([]);
      setRows([]);
      setMapping({});
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        aria-label="Choose CSV file"
        className={fieldClass}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {result && (
        <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
          <p className="font-medium text-foreground">
            Imported {result.created} application{result.created === 1 ? "" : "s"}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-danger">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {headers.length > 0 && (
        <>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Map columns ({rows.length} row{rows.length === 1 ? "" : "s"} found)
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {TARGET_FIELDS.map((field) => (
                <label key={field} className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-foreground">
                    {field}
                    {REQUIRED_FIELDS.has(field) && (
                      <span className="text-danger"> *</span>
                    )}
                  </span>
                  <select
                    className={fieldClass}
                    value={mapping[field] ?? ""}
                    onChange={(e) =>
                      setMapping((m) => ({
                        ...m,
                        [field]: e.target.value || null,
                      }))
                    }
                  >
                    <option value="">— none —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Preview (first {mappedPreview.length})
            </h4>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[600px] text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="px-2 py-1.5">Company</th>
                    <th className="px-2 py-1.5">Role</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Tier</th>
                    <th className="px-2 py-1.5">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedPreview.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-2 py-1.5">{row.company || "—"}</td>
                      <td className="px-2 py-1.5">{row.roleTitle || "—"}</td>
                      <td className="px-2 py-1.5">{row.status}</td>
                      <td className="px-2 py-1.5">{row.tier}</td>
                      <td className="px-2 py-1.5">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {missingRequired.length > 0 && (
            <p className="text-sm text-danger">
              Map required fields first: {missingRequired.join(", ")}
            </p>
          )}

          <div>
            <Button
              onClick={handleImport}
              disabled={missingRequired.length > 0 || isPending}
            >
              {isPending ? "Importing…" : `Import ${rows.length} rows`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
