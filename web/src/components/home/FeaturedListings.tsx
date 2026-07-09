import Link from "next/link";

import {
  MarketplaceCard,
  type ProductListItem,
} from "@/components/product/MarketplaceCard";

/**
 * Featured listings grid (S2.01). Renders MarketplaceCards for the featured products fetched
 * on the server from the frozen `GET /api/products` contract. When the catalog endpoint isn't
 * reachable yet, the parent passes an empty list and we show a Blankslate line
 * so the section is always present.
 */
export function FeaturedListings({ products }: { products: ProductListItem[] }) {
  return (
    <section className="py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">Featured listings</h2>
          <p className="text-sm text-fg-muted">Hand-picked products ready to acquire.</p>
        </div>
        <Link href="/marketplace" className="text-sm font-medium text-accent hover:underline">
          Browse all →
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <MarketplaceCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-canvas-subtle px-6 py-12 text-center">
          <p className="text-sm font-medium text-fg">Listings are on the way</p>
          <p className="text-sm text-fg-muted">
            Featured products will appear here once the catalog is published.
          </p>
        </div>
      )}
    </section>
  );
}
