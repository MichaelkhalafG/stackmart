import Link from "next/link";

import { Card } from "@/components/ui/card";

/** One category as embedded in a product list/detail payload (12_API_Specification.md). */
export type ProductCategory = { id: number; name: string; slug: string };

/**
 * A product as returned by `GET /api/products` (the FROZEN list contract,
 * 12_API_Specification.md). This is the shape the home + marketplace grids consume.
 */
export type ProductListItem = {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  price_cents: number;
  currency: string;
  category: ProductCategory | null;
  cover_image: string | null;
  is_featured: boolean;
  status: string;
};

/** Whole-dollar currency formatting for the mono price (seed prices are $900–$25,000). */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

/**
 * MarketplaceCard — the GitHub-Marketplace grid card (13_Component_Map.md), built on the
 * shadcn `Card` (Box pattern). Cover image, category tag pill, title, tagline, mono price.
 * Reused by the home Featured grid (S2.01) and `/marketplace` (S2.02). Server-safe: no hooks,
 * links to the listing detail. Renders the cover with a plain <img> (no next.config remote
 * pattern dependency) and a subtle fallback when a product has no image.
 */
export function MarketplaceCard({ product }: { product: ProductListItem }) {
  return (
    <Card className="group/mkt-card gap-0 p-0 transition-colors hover:ring-foreground/20">
      <Link
        href={`/listing/${product.slug}`}
        className="flex h-full flex-col rounded-[inherit] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="aspect-[16/9] w-full overflow-hidden border-b border-border bg-canvas-subtle">
          {product.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element -- external API storage host; next.config remote patterns are out of scope for S2.01
            <img
              src={product.cover_image}
              alt={product.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover/mkt-card:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center px-4 text-center">
              <span className="mono text-xs text-fg-muted">{product.title}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            {product.category ? (
              <span className="inline-flex items-center rounded-full bg-tag-bg px-2 py-0.5 text-xs font-medium text-tag-fg">
                {product.category.name}
              </span>
            ) : (
              <span aria-hidden />
            )}
            {product.is_featured ? (
              <span className="inline-flex items-center rounded-full bg-highlight px-2 py-0.5 text-xs font-medium text-fg">
                Featured
              </span>
            ) : null}
          </div>

          <h3 className="text-sm font-semibold text-fg group-hover/mkt-card:text-accent">
            {product.title}
          </h3>
          <p className="line-clamp-2 flex-1 text-sm text-fg-muted">{product.tagline}</p>
          <p className="mono text-sm font-semibold text-fg">
            {formatPrice(product.price_cents, product.currency)}
          </p>
        </div>
      </Link>
    </Card>
  );
}
