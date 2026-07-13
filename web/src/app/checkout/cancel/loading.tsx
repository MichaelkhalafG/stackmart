import { LoadingState } from "@/components/states/LoadingState";

/**
 * `/checkout/cancel` loading — the reference §04 loading card at the cancel page's centered
 * measure (max-w-md), so the swap to the cancelled card doesn't jump. Container from the layout.
 */
export default function CheckoutCancelLoading() {
  return (
    <div className="mx-auto max-w-md py-16" aria-busy="true" aria-label="Loading">
      <LoadingState label="loading" />
    </div>
  );
}
