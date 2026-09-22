import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/common/badges";
import { CompanyForm } from "@/components/companies/company-form";
import { companyToFormValues } from "@/components/companies/company-form-values";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { getCompanyById } from "@/lib/queries";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {company.name}
          </h1>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              {company.website}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/companies"
            className="text-muted-foreground text-sm hover:underline"
          >
            ← Back to companies
          </Link>
          <DeleteCompanyButton
            id={company.id}
            applicationCount={company.applications.length}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:max-w-xl">
          <CompanyForm
            mode="edit"
            companyId={company.id}
            initialValues={companyToFormValues(company)}
          />
        </div>
        <div>
          <h3 className="text-foreground mb-2 text-sm font-semibold">
            Applications ({company.applications.length})
          </h3>
          {company.applications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No applications under this company yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {company.applications.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/applications/${app.id}`}
                    className="border-border bg-card hover:border-primary flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground min-w-0 truncate">
                      {app.roleTitle}
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
