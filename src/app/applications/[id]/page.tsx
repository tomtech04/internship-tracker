import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/applications/application-form";
import { applicationToFormValues } from "@/components/applications/application-form-values";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { EventTimeline } from "@/components/applications/event-timeline";
import { StatusBadge, TierBadge } from "@/components/common/badges";
import { MarkdownView } from "@/components/common/markdown-view";
import {
  getAllCompaniesBasic,
  getAllContactsBasic,
  getApplicationById,
} from "@/lib/queries";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, companies, contacts] = await Promise.all([
    getApplicationById(id),
    getAllCompaniesBasic(),
    getAllContactsBasic(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-xl font-semibold">
              <Link
                href={`/companies/${application.companyId}`}
                className="hover:underline"
              >
                {application.company.name}
              </Link>
            </h1>
            <StatusBadge status={application.status} />
            <TierBadge tier={application.tier} />
          </div>
          <p className="text-muted-foreground text-sm">
            {application.roleTitle}
            {application.team ? ` · ${application.team}` : ""}
            {application.location ? ` · ${application.location}` : ""}
          </p>
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
            >
              View posting <ExternalLink size={12} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/board"
            className="text-muted-foreground text-sm hover:underline"
          >
            ← Back to board
          </Link>
          <DeleteApplicationButton id={application.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApplicationForm
            mode="edit"
            applicationId={application.id}
            initialValues={applicationToFormValues(application)}
            companies={companies}
            contacts={contacts}
          />
          {application.notes && (
            <div className="border-border bg-card mt-6 rounded-lg border p-4">
              <h3 className="text-foreground mb-2 text-sm font-semibold">
                Notes preview
              </h3>
              <MarkdownView content={application.notes} />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-foreground mb-2 text-sm font-semibold">
            Timeline
          </h3>
          <EventTimeline
            applicationId={application.id}
            events={application.events}
          />
        </div>
      </div>
    </div>
  );
}
