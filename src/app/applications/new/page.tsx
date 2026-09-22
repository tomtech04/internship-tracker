import { ApplicationForm } from "@/components/applications/application-form";
import { getAllContactsBasic } from "@/lib/queries";

export default async function NewApplicationPage() {
  const contacts = await getAllContactsBasic();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">
        New application
      </h1>
      <ApplicationForm mode="create" contacts={contacts} />
    </div>
  );
}
