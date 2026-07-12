import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/marketplace/ProductGridSkeleton";

/**
 * Marketplace loading skeleton (S5.02) — mirrors the header + filter sidebar + card grid (matches
 * the in-page <Suspense> fallback) so navigation into /marketplace doesn't jump. shadcn `Skeleton`
 * as-is + 06_UI_System.md tokens.
 */
export default function MarketplaceLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading marketplace">
      <header className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr]">
        <div className="hidden flex-col gap-3 lg:flex" aria-hidden>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
