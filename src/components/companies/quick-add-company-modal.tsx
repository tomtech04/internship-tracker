"use client";

import { CompanyForm } from "@/components/companies/company-form";
import { Modal } from "@/components/common/modal";

export function QuickAddCompanyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (company: { id: string; name: string }) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="New company">
      <CompanyForm
        mode="create"
        onCreated={(company) => {
          onCreated(company);
          onClose();
        }}
      />
    </Modal>
  );
}
