import {
  CalendarDays,
  Download,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";

import { ImportCsvWizard } from "@/components/data/import-csv-wizard";
import { RestoreJsonForm } from "@/components/data/restore-json-form";

function ExportLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Download;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="border-border bg-card hover:border-primary flex items-start gap-3 rounded-lg border p-4"
    >
      <Icon size={20} className="text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </a>
  );
}

export default function DataPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Import, export &amp; backup
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything here runs locally against your SQLite database — nothing
          leaves your machine.
        </p>
      </div>

      <section>
        <h2 className="text-foreground mb-3 text-sm font-semibold">Export</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ExportLink
            href="/api/export/csv"
            icon={FileSpreadsheet}
            title="Applications CSV"
            description="Spreadsheet-friendly export of every application."
          />
          <ExportLink
            href="/api/export/json"
            icon={FileJson}
            title="Full JSON backup"
            description="Everything — applications, contacts, and timeline events."
          />
          <ExportLink
            href="/api/export/ics"
            icon={CalendarDays}
            title="Calendar (.ics)"
            description="Upcoming interviews and follow-ups, ready to import."
          />
        </div>
      </section>

      <section>
        <h2 className="text-foreground mb-1 text-sm font-semibold">
          Import applications from CSV
        </h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Adds new applications — never deletes or overwrites existing ones.
        </p>
        <ImportCsvWizard />
      </section>

      <section>
        <h2 className="text-foreground mb-1 text-sm font-semibold">
          Restore from JSON backup
        </h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Replaces everything currently in the database with the contents of the
          backup file.
        </p>
        <RestoreJsonForm />
      </section>
    </div>
  );
}
