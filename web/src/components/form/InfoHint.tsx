"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * InfoHint — a small "what does this mean?" tooltip for the genuinely confusing bits (what the
 * deliverable ZIP is for, what verification access means, that money is typed in dollars, the flat
 * 20% commission…).
 *
 * Hand-rolled, no package. Accessibility:
 *   • a real <button type="button"> — keyboard-focusable, never submits the form
 *   • opens on hover AND on focus (keyboard users get it too), closes on blur/leave/Escape
 *   • `aria-describedby` points at the bubble, so a screen reader announces the explanation with
 *     the control; the bubble itself is `role="tooltip"`
 *   • the text is ALSO rendered to screen readers when collapsed (`sr-only`), so the hint is never
 *     available to sighted users only
 */
export function InfoHint({ label, children }: { label?: string; children: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label ?? "More information"}
        aria-describedby={id}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="inline-flex size-4 items-center justify-center rounded-full text-fg-muted transition-colors hover:text-accent focus-visible:ring-[3px] focus-visible:ring-accent/25 focus-visible:outline-none"
      >
        <Info className="size-[14px]" strokeWidth={2.2} aria-hidden />
      </button>

      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-[min(240px,60vw)] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border border-border bg-canvas px-3 py-2 text-[12.5px] leading-[1.45] font-normal text-fg shadow-mega transition-opacity sm:w-[240px]",
          open ? "opacity-100" : "sr-only opacity-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
