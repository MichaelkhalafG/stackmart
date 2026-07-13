import { LoadingState } from "@/components/states/LoadingState";

/**
 * `/checkout/mock` loading — the reference §04 loading card at the mock checkout's centered
 * measure. (Dev-only route; it never names a payment gateway.) Container from the checkout layout.
 */
export default function CheckoutMockLoading() {
  return (
    <div className="mx-auto max-w-md py-16" aria-busy="true" aria-label="Loading">
      <LoadingState label="preparing checkout" />
    </div>
  );
}
