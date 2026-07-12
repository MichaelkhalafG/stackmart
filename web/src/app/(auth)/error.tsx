"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ErrorState";

/**
 * Error boundary for the auth route group (S5.02) — a fallback for login / register /
 * forgot-password / reset-password (the forms handle their own 422s inline; this catches
 * unexpected render/runtime errors). Client component.
 */
export default function AuthError({
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
        description="We couldn't load this page. Try again, or head back home."
        reset={reset}
      />
    </div>
  );
}
