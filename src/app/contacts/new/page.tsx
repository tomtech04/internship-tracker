import { ContactForm } from "@/components/contacts/contact-form";
import { getAllApplications } from "@/lib/queries";

export default async function NewContactPage() {
  const applications = await getAllApplications();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">New contact</h1>
      <ContactForm
        mode="create"
        applications={applications.map((a) => ({
          id: a.id,
          company: a.company,
          roleTitle: a.roleTitle,
        }))}
      />
    </div>
  );
}
