import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutSuccess } from "@/components/checkout/CheckoutSuccess";

export const metadata: Metadata = {
  title: "Purchase complete",
  robots: { index: false, follow: false },
};

/**
 * `/checkout/success?ref=` (S4.05) — resolves the order by provider_reference and shows the
 * delivered license + download. Client-fetched (needs the Bearer token), so wrapped in Suspense
 * for `useSearchParams`.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccess />
    </Suspense>
  );
}
