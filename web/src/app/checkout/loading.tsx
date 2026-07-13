import { LoadingState } from "@/components/states/LoadingState";

/**
 * Group-level loading for the checkout routes — the reference §04 loading card (spinner ring +
 * mono terminal line + shimmer bars), at the checkout pages' centered measure. The checkout layout
 * supplies the page container.
 */
export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-md py-16" aria-busy="true" aria-label="Loading">
      <LoadingState label="preparing checkout" />
    </div>
  );
}
