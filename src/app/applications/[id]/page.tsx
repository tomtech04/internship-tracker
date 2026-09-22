import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/applications/application-form";
import { applicationToFormValues } from "@/components/applications/application-form-values";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { EventTimeline } from "@/components/applications/event-timeline";
import { StatusBadge, TierBadge } from "@/components/common/badges";
import { MarkdownView } from "@/components/common/markdown-view";
import { getAllContactsBasic, getApplicationById } from "@/lib/queries";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, contacts] = await Promise.all([
    getApplicationById(id),
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
            <h1 className="text-xl font-semibold text-foreground">
              {application.company}
            </h1>
            <StatusBadge status={application.status} />
            <TierBadge tier={application.tier} />
          </div>
          <p className="text-sm text-muted-foreground">
            {application.roleTitle}
            {application.team ? ` · ${application.team}` : ""}
            {application.location ? ` · ${application.location}` : ""}
          </p>
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View posting <ExternalLink size={12} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/board"
            className="text-sm text-muted-foreground hover:underline"
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
            contacts={contacts}
          />
          {application.notes && (
            <div className="mt-6 rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Notes preview
              </h3>
              <MarkdownView content={application.notes} />
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
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
