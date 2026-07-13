import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * Checkout success loading skeleton — mirrors the order/license card while `/checkout/success?ref=`
 * resolves the order, so the confirmation doesn't jump. Container from the checkout layout.
 */
export default function CheckoutSuccessLoading() {
  return (
    <div className="mx-auto max-w-xl py-8" aria-busy="true" aria-label="Loading order">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-canvas p-6">
        <TerminalLine>confirming your order</TerminalLine>
        <Shimmer className="h-6 w-48" delay="0.08s" />
        <Shimmer className="h-4 w-full" delay="0.16s" />
        <Shimmer className="h-4 w-3/4" delay="0.24s" />
        <Shimmer className="h-10 w-full" delay="0.32s" />
        <Shimmer className="h-10 w-40" delay="0.4s" />
      </div>
    </div>
  );
}
