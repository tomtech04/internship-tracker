import { Plus, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { getAllContacts } from "@/lib/queries";

export default async function ContactsPage() {
  const contacts = await getAllContacts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-xl font-semibold">Contacts</h1>
        <Link
          href="/contacts/new"
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90"
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
              className="bg-primary text-primary-foreground rounded-md px-3.5 py-2 text-sm font-medium hover:opacity-90"
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
              className="border-border bg-card hover:border-primary flex flex-col gap-1 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  {contact.name}
                </span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {contact.relationship}
                </span>
              </div>
              {(contact.role || contact.company) && (
                <p className="text-muted-foreground text-sm">
                  {[contact.role, contact.company].filter(Boolean).join(" @ ")}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
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
