"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ErrorState";

/**
 * Root error boundary (S5.02) — the fallback for any error not caught by a nearer route-group
 * boundary (e.g. a group layout error). Renders inside the root layout. Client component.
 */
export default function RootError({
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
        title="Something went wrong"
        description="An unexpected error occurred. Try again, or head back home."
        reset={reset}
        code={error.digest}
      />
    </div>
  );
}
