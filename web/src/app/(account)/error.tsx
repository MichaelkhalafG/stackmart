"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ErrorState";

/**
 * Error boundary for the guarded account route group (S5.02) — catches errors from /account and
 * /account/purchases. Renders inside the (account) guard layout. Client component.
 */
export default function AccountError({
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
        title="We couldn't load your account"
        description="Your session may have expired, or the service is temporarily unavailable. Try again."
        reset={reset}
      />
    </div>
  );
}
