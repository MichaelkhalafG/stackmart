import { Suspense } from "react";
import type { Metadata } from "next";

import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { ProductGridSkeleton } from "@/components/marketplace/ProductGridSkeleton";
import { BreadcrumbJsonLd, DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const MARKETPLACE_DESCRIPTION =
  "Browse vetted micro-SaaS products, web apps, and codebases. Filter by category, tech stack, and price, then evaluate each listing with a live demo and repository review.";

export const metadata: Metadata = {
  title: "Marketplace",
  description: MARKETPLACE_DESCRIPTION,
  alternates: { canonical: "/marketplace" },
  openGraph: {
    type: "website",
    url: "/marketplace",
    title: "Marketplace · MDN STACKMART",
    description: MARKETPLACE_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace · MDN STACKMART",
    description: MARKETPLACE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * `/marketplace` — the marketplace is URL-driven and client-filtered via TanStack Query against
 * the frozen `GET /api/products` contract (08_Frontend_Architecture.md §4). This thin Server
 * Component provides the required <Suspense> boundary for the client browser's `useSearchParams`
 * and renders a skeleton fallback during hydration.
 */
export default function MarketplacePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Marketplace", path: "/marketplace" },
        ]}
      />
      <Suspense fallback={<MarketplaceFallback />}>
        <MarketplaceBrowser />
      </Suspense>
    </>
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
