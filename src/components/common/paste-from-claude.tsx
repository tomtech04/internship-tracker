"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";
import { fieldClass } from "@/components/common/form-fields";
import {
  CLAUDE_AUTOFILL_TEMPLATE,
  parseAutofillText,
  type ParsedAutofillFields,
} from "@/lib/autofill";

/**
 * Shared "paste a Claude reply, get form fields back" widget. How many of
 * the parsed fields actually apply depends on the form it's embedded in
 * (quick add only has a handful; the full application form has all of
 * them) — the caller's onParsed decides what to keep. The filled-count
 * message reflects everything *recognized* in the pasted text, not just
 * what this particular form applied, which is deliberately how the CSV
 * import's row-error messages work too: report what was found, not what a
 * narrower form happened to use.
 */
export function PasteFromClaudeSection({
  onParsed,
}: {
  onParsed: (parsed: ParsedAutofillFields) => void | Promise<void>;
}) {
  const [pasteText, setPasteText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  function handleCopyTemplate() {
    navigator.clipboard.writeText(CLAUDE_AUTOFILL_TEMPLATE).then(() => {
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 2000);
    });
  }

  async function handleParse() {
    const parsed = parseAutofillText(pasteText);
    const filledCount = Object.values(parsed).filter(Boolean).length;
    if (filledCount === 0) {
      setMessage("Couldn't find any recognizable fields in that text.");
      return;
    }

    setIsPending(true);
    await onParsed(parsed);
    setIsPending(false);
    setMessage(
      `Filled in ${filledCount} field${filledCount === 1 ? "" : "s"} — review before saving.`,
    );
    setPasteText("");
  }

  return (
    <details className="border-border bg-muted/30 rounded-lg border p-3">
      <summary className="text-foreground cursor-pointer text-sm font-semibold">
        Paste from Claude
      </summary>
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">
          Copy the template into a fresh Claude chat along with your
          confirmation email or the job posting, then paste Claude&apos;s
          reply below. See{" "}
          <code className="bg-muted rounded px-1 py-0.5">
            docs/claude-autofill-template.md
          </code>{" "}
          for the full explanation.
        </p>
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyTemplate}
          >
            {templateCopied ? "Copied ✓" : "Copy template"}
          </Button>
        </div>
        <textarea
          aria-label="Paste Claude's reply here"
          placeholder="Paste Claude's reply here…"
          rows={4}
          className={fieldClass}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        {message && <p className="text-muted-foreground text-xs">{message}</p>}
        <div>
          <Button
            type="button"
            size="sm"
            disabled={!pasteText.trim() || isPending}
            onClick={handleParse}
          >
            {isPending ? "Filling…" : "Parse & fill form"}
          </Button>
        </div>
      </div>
    </details>
  );
}
