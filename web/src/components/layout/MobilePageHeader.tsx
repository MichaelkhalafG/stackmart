import type { ReactNode } from "react";

/**
 * Shared mobile (<md) page header: navy coding band + mono `$ command` line + title + subhead, with
 * an optional `extra` slot (e.g. the marketplace count). `md:hidden`; presentational, no hooks.
 *
 * Full-bleed via `w-screen` + `ml-[calc(50%-50vw)]` from any horizontally-symmetric container; the
 * body's `overflow-x: clip` absorbs the 100vw. Caret uses `anim-blink` (off under reduced-motion).
 */
export function MobilePageHeader({
  command,
  title,
  subhead,
  extra,
}: {
  /** command after the `$` prompt, e.g. `mdn browse --vetted`. */
  command: string;
  title: string;
  subhead: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mesh-hero-visual relative ml-[calc(50%_-_50vw)] w-screen overflow-hidden px-5 pt-7 pb-8 md:hidden">
      <div className="grid-motif-hero absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="mono mb-3 flex items-center gap-1.5 text-[11px] tracking-[0.08em] text-tag-bg">
          <span className="opacity-70">$</span> {command}
          <span
            className="anim-blink inline-block h-[12px] w-[6px] bg-tag-bg align-middle"
            aria-hidden
          />
        </p>
        <h1 className="text-[1.7rem] leading-tight font-bold tracking-[-0.01em] text-primary-foreground">
          {title}
        </h1>
        <p className="mt-2.5 text-[14px] leading-[1.5] text-canvas/75">{subhead}</p>
        {extra ? <div className="mt-4">{extra}</div> : null}
      </div>
    </div>
  );
}
