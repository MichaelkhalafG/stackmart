import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared loading primitives (Forms & Utility reference §04 "loading").
 *
 * The reference's loading card is three things: a spinner ring (lavender track + royal-blue
 * leading edge), a mono terminal line with a blinking cursor, and one or two shimmer bars
 * (canvas-subtle track swept by a lavender gradient). They are exported separately so the
 * route-level `loading.tsx` files can mirror the shape of the page they cover — `Shimmer` stands
 * in for real content blocks (no layout jump), while `LoadingState` is the whole composed card for
 * routes with no distinctive layout to mirror.
 *
 * All animations come from globals.css (`.anim-spin-ring`, `.anim-blink`, `.anim-shimmer`) and are
 * already disabled under `prefers-reduced-motion`. Tokens only — no hex.
 */

/** Spinner ring — lavender track, royal-blue leading edge. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "anim-spin-ring block size-10 rounded-full border-4 border-tag-bg border-t-accent",
        className,
      )}
    />
  );
}

/**
 * A mono terminal line (`$ fetching listings`) with a blinking cursor.
 * `tone="light"` is the on-navy variant (lavender text + lavender cursor).
 */
export function TerminalLine({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mono text-[13px]",
        tone === "light" ? "text-tag-bg" : "text-primary",
        className,
      )}
    >
      <span aria-hidden>$ </span>
      {children}
      <span
        aria-hidden
        className={cn(
          "anim-blink ml-1 inline-block h-3 w-1.5 -translate-y-px align-middle",
          tone === "light" ? "bg-tag-bg" : "bg-accent",
        )}
      />
    </p>
  );
}

/**
 * A shimmer placeholder: a canvas-subtle track with a lavender gradient sweeping across it.
 * Sized entirely by `className`, so it can stand in for a line of text or a whole card and keep
 * the covered page's measurements. `delay` staggers the sweep across stacked bars.
 */
export function Shimmer({
  className,
  delay,
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-md bg-canvas-subtle", className)}
    >
      <span
        className="anim-shimmer absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-transparent via-tag-bg to-transparent"
        style={delay ? { animationDelay: delay } : undefined}
      />
    </div>
  );
}

/** The composed reference card: spinner + terminal line + two shimmer bars, centered. */
export function LoadingState({
  label = "loading",
  className,
}: {
  /** The terminal line, rendered after the `$` prompt — e.g. "fetching listings". */
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-border bg-canvas px-6 py-14 text-center",
        className,
      )}
    >
      <Spinner />
      <TerminalLine className="mt-[18px]">{label}</TerminalLine>
      <div className="mt-[22px] flex w-full max-w-xs flex-col gap-[9px]">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" delay="0.2s" />
      </div>
    </div>
  );
}
