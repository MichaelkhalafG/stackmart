import { Suspense } from "react";

import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { ProductGridSkeleton } from "@/components/marketplace/ProductGridSkeleton";

/**
 * `/marketplace` — the marketplace is URL-driven and client-filtered via TanStack Query against
 * the frozen `GET /api/products` contract (08_Frontend_Architecture.md §4). This thin Server
 * Component provides the required <Suspense> boundary for the client browser's `useSearchParams`
 * and renders a skeleton fallback during hydration.
 */
export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceFallback />}>
      <MarketplaceBrowser />
    </Suspense>
  );
}

function MarketplaceFallback() {
  return (
    <div className="py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Marketplace</h1>
        <p className="text-sm text-fg-muted">
          Browse vetted micro-SaaS products, web apps, and codebases.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr]">
        <div className="hidden lg:block" aria-hidden />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
