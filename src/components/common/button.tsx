import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-input bg-background text-foreground hover:bg-muted disabled:opacity-50",
  danger:
    "bg-danger text-danger-foreground hover:opacity-90 disabled:opacity-50",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      className={cn(
        "focus-visible:ring-ring inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
