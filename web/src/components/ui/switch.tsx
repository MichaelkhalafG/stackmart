"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Toggle / switch — Forms & Utility reference §03.
 *
 * On = royal-blue track with the knob to the right; off = border-grey track, knob left; disabled =
 * dimmed. Built on a native checkbox (peer) so it needs no package and stays keyboard-accessible.
 * Laid out as a row: label on the left, switch on the right, exactly as the reference shows.
 */
export function Switch({
  label,
  description,
  className,
  disabled,
  ...props
}: ComponentProps<"input"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label
      className={cn(
        "group flex items-center justify-between gap-4",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className={cn("text-sm", disabled ? "text-fg-muted" : "text-fg")}>{label}</span>
        {description ? (
          <span className="text-[12.5px] leading-[1.45] text-fg-muted">{description}</span>
        ) : null}
      </span>

      <input type="checkbox" role="switch" className="peer sr-only" disabled={disabled} {...props} />
      <span
        aria-hidden
        className={cn(
          "relative h-[22px] w-10 flex-none rounded-full bg-border transition-colors",
          "peer-checked:bg-accent",
          "peer-focus-visible:ring-[3px] peer-focus-visible:ring-accent/25",
        )}
      >
        <span className="absolute top-0.5 left-0.5 size-[18px] rounded-full bg-canvas shadow-sm transition-transform peer-checked:translate-x-[18px] group-has-checked:translate-x-[18px]" />
      </span>
    </label>
  );
}
