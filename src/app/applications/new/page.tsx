import { ApplicationForm } from "@/components/applications/application-form";
import { getAllCompaniesBasic, getAllContactsBasic } from "@/lib/queries";

export default async function NewApplicationPage() {
  const [companies, contacts] = await Promise.all([
    getAllCompaniesBasic(),
    getAllContactsBasic(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-foreground text-xl font-semibold">New application</h1>
      <ApplicationForm
        mode="create"
        companies={companies}
        contacts={contacts}
      />
    </div>
  );
}
