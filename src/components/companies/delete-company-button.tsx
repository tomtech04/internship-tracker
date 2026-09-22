"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteCompany } from "@/actions/companies";
import { ConfirmButton } from "@/components/common/confirm-button";

export function DeleteCompanyButton({
  id,
  applicationCount,
}: {
  id: string;
  applicationCount: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteCompany(id);
      router.push("/companies");
    });
  }

  return (
    <ConfirmButton
      label="Delete"
      confirmLabel={
        applicationCount > 0
          ? `Delete this company AND its ${applicationCount} application${applicationCount === 1 ? "" : "s"}?`
          : "Delete this company?"
      }
      onConfirm={handleDelete}
    />
  );
}
