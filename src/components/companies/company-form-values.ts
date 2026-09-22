// Plain data mapping — deliberately NOT in company-form.tsx, which has
// "use client" at the top. Every export of a "use client" file becomes a
// client-only reference from the server's perspective (even a plain
// function), so Server Components can't call companyToFormValues()
// directly if it lived there. See application-form-values.ts for the
// same pattern and the bug it fixes.

export type CompanyFormValues = {
  name: string;
  website: string;
  portalUsername: string;
  portalPassword: string;
  notes: string;
};

export const EMPTY_COMPANY_FORM_VALUES: CompanyFormValues = {
  name: "",
  website: "",
  portalUsername: "",
  portalPassword: "",
  notes: "",
};

export function companyToFormValues(company: {
  name: string;
  website: string | null;
  portalUsername: string | null;
  portalPassword: string | null;
  notes: string | null;
}): CompanyFormValues {
  return {
    name: company.name,
    website: company.website ?? "",
    portalUsername: company.portalUsername ?? "",
    portalPassword: company.portalPassword ?? "",
    notes: company.notes ?? "",
  };
}
