import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { MockCheckout } from "@/components/checkout/MockCheckout";

export const metadata: Metadata = {
  title: "Dev checkout (mock)",
  robots: { index: false, follow: false },
};

/**
 * `/checkout/mock` (S4.05) — DEV-ONLY. A stand-in for a hosted checkout while the real gateway is
 * a pending business decision; it drives the order flow by posting a simulated event to the real
 * webhook. Guarded to non-production (a production build serves a 404). Never names a gateway.
 */
export default function CheckoutMockPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <MockCheckout />
    </Suspense>
  );
}
