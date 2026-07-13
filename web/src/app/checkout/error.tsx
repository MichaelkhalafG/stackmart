"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ErrorState";

/**
 * Error boundary for the checkout route group (S5.02) — catches errors from /checkout/mock,
 * /checkout/success (order lookup), and /checkout/cancel. Client component. Note: the flow ships
 * on FakePaymentProvider — no gateway is referenced here.
 */
export default function CheckoutError({
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
        title="Checkout hit a snag"
        description="We couldn't complete this step. Try again, or return to your purchases."
        reset={reset}
        code={error.digest}
        homeHref="/account/purchases"
        homeLabel="Go to purchases"
      />
    </div>
  );
}
