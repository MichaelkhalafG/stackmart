import { ProductGridSkeleton } from "@/components/marketplace/ProductGridSkeleton";
import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * Marketplace loading skeleton — mirrors the header + filter sidebar + card grid (the grid reuses
 * the in-page <Suspense> fallback, so there is no second jump when it swaps), with the reference
 * §04 mono terminal line above the filters. The marketplace layout supplies the page container.
 */
export default function MarketplaceLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading marketplace">
      <header className="mb-6 flex flex-col gap-2">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-4 w-80 max-w-full" delay="0.1s" />
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr]">
        <div className="hidden flex-col gap-3 lg:flex">
          <TerminalLine>fetching listings</TerminalLine>
          <Shimmer className="h-36 w-full" delay="0.08s" />
          <Shimmer className="h-36 w-full" delay="0.16s" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
