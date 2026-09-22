"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";

export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel = "Are you sure?",
  variant = "danger",
  size = "sm",
  className,
}: {
  onConfirm: () => void;
  label: string;
  confirmLabel?: string;
  variant?: "danger" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{confirmLabel}</span>
        <Button
          type="button"
          variant="danger"
          size={size}
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          Yes
        </Button>
        <Button
          type="button"
          variant="secondary"
          size={size}
          onClick={() => setConfirming(false)}
        >
          No
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => setConfirming(true)}
    >
      {label}
    </Button>
  );
}
