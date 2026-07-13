"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ErrorState (Forms & Utility reference §04 "error") — the shared error UI for every App Router
 * `error.tsx` boundary: a 56px danger-tinted tile with a danger glyph, a bold navy heading, one
 * muted line, an optional mono `err_code:` chip, and an outline "Retry" that calls the boundary's
 * `reset()`. Client component (boundaries are always client). Outline buttons only — Buy Now stays
 * the sole primary elsewhere.
 *
 * Self-contained container: error boundaries render directly under <main>, which is NOT wrapped in
 * one (the landing is full-bleed), so the error UI supplies its own page width.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "This is usually temporary. Try again in a moment.",
  reset,
  code,
  homeHref = "/",
  homeLabel = "Back to home",
  extraAction,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  /** Optional error reference (e.g. the boundary's `error.digest`) — shown as an `err_code:` chip. */
  code?: string;
  homeHref?: string;
  homeLabel?: string;
  extraAction?: ReactNode;
}) {
  return (
    <Container className="py-6">
      <div className="flex flex-col items-center justify-center rounded-md border border-border bg-canvas px-6 py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-md bg-danger/10 text-danger">
          <AlertTriangle className="size-[26px]" aria-hidden />
        </div>

        <h2 className="text-[1.1rem] font-bold text-primary">{title}</h2>
        <p className="mt-1.5 max-w-[44ch] text-[13.5px] leading-[1.5] text-fg-muted">
          {description}
        </p>

        {code ? (
          <p className="mono mt-3 rounded-md border border-border bg-canvas-subtle px-2.5 py-1.5 text-[11px] text-fg-muted">
            err_code: {code}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Retry
            </button>
          ) : null}
          <Link href={homeHref} className={cn(buttonVariants({ variant: "outline" }))}>
            {homeLabel}
          </Link>
          {extraAction}
        </div>
      </div>
    </Container>
  );
}
