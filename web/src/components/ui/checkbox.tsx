"use client";

import type { ComponentProps } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Checkbox — Forms & Utility reference §03.
 *
 * A real <input type="checkbox"> (peer) drives a styled box, so it stays keyboard- and
 * form-native with no package. Checked = navy fill + white tick; unchecked = 1px border on canvas;
 * disabled = canvas-subtle + muted label. Focus shows the royal-blue ring.
 */
export function Checkbox({
  label,
  className,
  disabled,
  ...props
}: ComponentProps<"input"> & { label?: React.ReactNode }) {
  return (
    <label
      className={cn(
        "group inline-flex items-center gap-2.5 text-sm text-fg select-none",
        disabled ? "cursor-not-allowed text-fg-muted" : "cursor-pointer",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" disabled={disabled} {...props} />
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] flex-none items-center justify-center rounded-[5px] border border-border bg-canvas transition-colors",
          "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-[3px] peer-focus-visible:ring-accent/25",
          "peer-disabled:bg-canvas-subtle",
        )}
      >
        <Check className="size-[11px] opacity-0 peer-checked:opacity-100 group-has-checked:opacity-100" strokeWidth={3.4} />
      </span>
      {label}
    </label>
  );
}
