import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { productImageOrDefault } from "@/lib/imageUrl";

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
  // Always renderable: a real image, else the single shared default (never an empty/coloured tile).
  const cover = productImageOrDefault(product.cover_image);
  return (
    // Tasteful depth: a soft resting shadow that deepens to a navy-tinted float on hover, with the
    // border warming to navy. Elevation only (no transform) — zero layout shift, per the card rule.
    <Card className="group/mkt-card gap-0 overflow-hidden p-0 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-float-md">
      <Link
        href={`/listing/${product.slug}`}
        className="flex h-full flex-col rounded-[inherit] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-canvas-subtle">
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover/mkt-card:scale-[1.02]"
          />
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
              <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                Featured
              </span>
            ) : null}
          </div>

          <h3 className="text-sm font-semibold text-fg group-hover/mkt-card:text-accent">
            {product.title}
          </h3>
          <p className="line-clamp-2 flex-1 text-sm text-fg-muted">{product.tagline}</p>
          {/* Asking price = the dominant figure (what the buyer pays): labelled, navy, bold.
              The list contract carries no MRR, so no earn-metric competes with it here. */}
          <div className="mt-0.5">
            <div className="text-[11px] tracking-[0.06em] text-fg-muted uppercase">Price</div>
            <div className="mono text-lg font-bold text-primary">
              {formatPrice(product.price_cents, product.currency)}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
