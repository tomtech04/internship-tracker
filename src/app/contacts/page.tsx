import { Plus, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { getAllContacts } from "@/lib/queries";

export default async function ContactsPage() {
  const contacts = await getAllContacts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
        <Link
          href="/contacts/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} />
          New contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Track referrals, recruiters, and alumni here — then link them to the applications they helped with."
          action={
            <Link
              href="/contacts/new"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              New contact
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {contact.name}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {contact.relationship}
                </span>
              </div>
              {(contact.role || contact.company) && (
                <p className="text-sm text-muted-foreground">
                  {[contact.role, contact.company].filter(Boolean).join(" @ ")}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {contact.applications.length} linked application
                {contact.applications.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
