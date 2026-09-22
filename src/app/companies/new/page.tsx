import { CompanyForm } from "@/components/companies/company-form";

export default function NewCompanyPage() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-foreground text-xl font-semibold">New company</h1>
      <CompanyForm mode="create" />
    </div>
  );
}
