import Link from "next/link";

import type { FeaturedProduct } from "@/lib/catalog";
import { ListingCard } from "./ListingCard";

/**
 * Featured listings — the designed section, wired to the REAL catalog.
 *
 * Products come from `GET /api/products` (featured-flagged, with MRR read from the detail
 * endpoint) via the server fetch in the page. Nothing here is mocked. If the catalog is empty or
 * the API is unreachable the section degrades to a muted line rather than disappearing.
 */
export function FeaturedListings({ products }: { products: FeaturedProduct[] }) {
  return (
    <section
      id="marketplace"
      className="container-page scroll-mt-20 py-[clamp(64px,8vw,108px)]"
    >
      <div className="mb-[42px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
            Featured listings
          </div>
          <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary">
            Hand-picked businesses, ready to own
          </h2>
        </div>
        <Link
          href="/marketplace"
          className="text-[15px] font-semibold text-accent transition-colors hover:text-primary"
        >
          View all listings →
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {products.map((product, index) => (
            <ListingCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">
          Featured listings will appear here once the catalog is published.
        </p>
      )}
    </section>
  );
}
