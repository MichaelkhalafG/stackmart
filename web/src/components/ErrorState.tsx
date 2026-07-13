"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Blankslate } from "@/components/marketplace/Blankslate";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ErrorState (S5.02) — the shared friendly error UI for App Router `error.tsx` boundaries. Reuses
 * the Primer `Blankslate` (06_UI_System.md) with an alert glyph, a "Try again" that calls the
 * boundary's `reset()`, and a link home. Client component (boundaries are always client). Outline
 * buttons only — Buy Now stays the sole primary elsewhere.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "This is usually temporary. Try again in a moment.",
  reset,
  homeHref = "/",
  homeLabel = "Back to home",
  extraAction,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
  extraAction?: ReactNode;
}) {
  return (
    <Blankslate
      icon={<AlertTriangle className="size-8" />}
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Try again
            </button>
          ) : null}
          <Link href={homeHref} className={cn(buttonVariants({ variant: "outline" }))}>
            {homeLabel}
          </Link>
          {extraAction}
        </div>
      }
    />
  );
}
