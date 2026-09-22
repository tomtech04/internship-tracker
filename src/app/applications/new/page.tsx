import { ApplicationForm } from "@/components/applications/application-form";
import { getAllCompaniesBasic, getAllContactsBasic } from "@/lib/queries";

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const [{ companyId }, companies, contacts] = await Promise.all([
    searchParams,
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
        defaultCompanyId={companyId}
      />
    </div>
  );
}
