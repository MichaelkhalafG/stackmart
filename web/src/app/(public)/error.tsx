"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ErrorState";

/**
 * Error boundary for the public route group (S5.02) — catches errors from home / marketplace /
 * listing / sell / static pages (e.g. the listing detail's server fetch throwing on a non-404
 * failure) and shows a friendly retry. Client component.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16">
      <ErrorState
        title="We couldn't load this page"
        description="The catalog service may be temporarily unavailable. Try again in a moment."
        reset={reset}
      />
    </div>
  );
}
