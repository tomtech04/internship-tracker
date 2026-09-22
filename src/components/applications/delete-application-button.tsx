"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteApplication } from "@/actions/applications";
import { ConfirmButton } from "@/components/common/confirm-button";

export function DeleteApplicationButton({ id }: { id: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteApplication(id);
      router.push("/table");
    });
  }

  return (
    <ConfirmButton
      label="Delete"
      confirmLabel="Delete this application?"
      onConfirm={handleDelete}
    />
  );
}
