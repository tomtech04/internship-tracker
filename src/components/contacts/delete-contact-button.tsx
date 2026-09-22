"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteContact } from "@/actions/contacts";
import { ConfirmButton } from "@/components/common/confirm-button";

export function DeleteContactButton({ id }: { id: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteContact(id);
      router.push("/contacts");
    });
  }

  return (
    <ConfirmButton
      label="Delete"
      confirmLabel="Delete this contact?"
      onConfirm={handleDelete}
    />
  );
}
