"use client";

import { ContactForm } from "@/components/contacts/contact-form";
import { Modal } from "@/components/common/modal";

export function QuickAddContactModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (contact: { id: string; name: string }) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="New contact">
      <ContactForm
        mode="create"
        applications={[]}
        compact
        onCreated={(contact) => {
          onCreated(contact);
          onClose();
        }}
      />
    </Modal>
  );
}
