import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/common/badges";
import { ContactForm } from "@/components/contacts/contact-form";
import { contactToFormValues } from "@/components/contacts/contact-form-values";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { getAllApplications, getContactById } from "@/lib/queries";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, applications] = await Promise.all([
    getContactById(id),
    getAllApplications(),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {contact.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {contact.relationship}
            {contact.role || contact.company
              ? ` · ${[contact.role, contact.company].filter(Boolean).join(" @ ")}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contacts"
            className="text-muted-foreground text-sm hover:underline"
          >
            ← Back to contacts
          </Link>
          <DeleteContactButton id={contact.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm
            mode="edit"
            contactId={contact.id}
            initialValues={contactToFormValues(contact)}
            applications={applications.map((a) => ({
              id: a.id,
              company: a.company.name,
              roleTitle: a.roleTitle,
            }))}
          />
        </div>
        <div>
          <h3 className="text-foreground mb-2 text-sm font-semibold">
            Linked applications ({contact.applications.length})
          </h3>
          {contact.applications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No applications linked yet — check the boxes in the form.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {contact.applications.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/applications/${app.id}`}
                    className="border-border bg-card hover:border-primary flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="text-foreground font-medium">
                        {app.company.name}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — {app.roleTitle}
                      </span>
                    </span>
                    <StatusBadge status={app.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
