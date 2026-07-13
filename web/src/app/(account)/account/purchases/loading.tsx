import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * Purchases loading skeleton — heading + table rows while `GET /api/orders` loads (mirrors the
 * PurchasesTable pending state so it doesn't jump). Container comes from the (account) layout.
 */
export default function PurchasesLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading purchases">
      <div className="mb-6 flex flex-col gap-2">
        <Shimmer className="h-8 w-40" />
        <Shimmer className="h-4 w-72 max-w-full" delay="0.1s" />
      </div>
      <div className="rounded-md border border-border bg-canvas">
        <div className="border-b border-border px-4 py-3">
          <TerminalLine>fetching your orders</TerminalLine>
        </div>
        <div className="flex flex-col gap-2 p-2">
          {[0, 1, 2, 3].map((i) => (
            <Shimmer key={i} className="h-12 w-full" delay={`${i * 0.1}s`} />
          ))}
        </div>
      </div>
    </div>
  );
}
