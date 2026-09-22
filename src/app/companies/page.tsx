import { Building2, Plus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { getAllCompanies } from "@/lib/queries";

export default async function CompaniesPage() {
  const companies = await getAllCompanies();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-xl font-semibold">Companies</h1>
        <Link
          href="/companies/new"
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          New company
        </Link>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Every application lives under a company — add one here, or create one inline while adding an application."
          action={
            <Link
              href="/companies/new"
              className="bg-primary text-primary-foreground rounded-md px-3.5 py-2 text-sm font-medium hover:opacity-90"
            >
              New company
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="border-border bg-card hover:border-primary flex flex-col gap-1 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  {company.name}
                </span>
                {company.portalUsername && (
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    login saved
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {company.applications.length} application
                {company.applications.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
