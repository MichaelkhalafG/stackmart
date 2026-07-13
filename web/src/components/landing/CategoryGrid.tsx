import Link from "next/link";

import { categoryInitials, type CategoryWithCount } from "@/lib/catalog";

/**
 * Categories grid — the designed tiles, wired to the REAL catalog.
 *
 * Categories come from `GET /api/categories`; the listing count on each tile is the real
 * `meta.total` for that category from `GET /api/products?category=<slug>` (the categories endpoint
 * deliberately does not expose counts). When a count is unknown the line is omitted rather than
 * showing an invented number. Each tile links to `/marketplace?category=<slug>`.
 *
 * The design uses a per-category glyph; with categories now dynamic there is no fixed icon set, so
 * each tile uses the category's real initials in the same lavender badge (matching the mega-menu).
 */
export function CategoryGrid({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <section id="about" className="mesh-categories scroll-mt-20 border-t border-border">
      <div className="container-page py-[clamp(64px,8vw,108px)]">
        <div className="mb-[42px]">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
            Browse by category
          </div>
          <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary">
            Find your next acquisition
          </h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                className="category-tile flex items-center gap-[15px] rounded-lg border border-border bg-canvas p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-tag-bg text-sm font-bold text-accent">
                  {categoryInitials(category.name)}
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-primary">{category.name}</span>
                  {category.count !== null ? (
                    <span className="mono text-xs text-fg-muted">
                      {category.count} {category.count === 1 ? "listing" : "listings"}
                    </span>
                  ) : null}
                </span>
                <span className="text-fg-muted" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            Categories will appear here once the catalog is published.
          </p>
        )}
      </div>
    </section>
  );
}
