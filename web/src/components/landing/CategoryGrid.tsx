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
        <div className="mb-[42px] max-sm:mb-8">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
            Browse by category
          </div>
          <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary max-sm:text-[clamp(1.5rem,7vw,1.9rem)]">
            Find your next acquisition
          </h2>
        </div>

        {categories.length > 0 ? (
          /* Phones get a fixed 2-up grid — `minmax(240px,1fr)` auto-fit collapsed to one lonely
             column below 640px, which read as sparse for tiles this small. The auto-fit track list
             is restored verbatim at `sm:`, so ≥640px is unchanged. */
          <div className="grid grid-cols-2 gap-[18px] max-sm:gap-3 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {categories.map((category) => (
              /* At ~156px wide the horizontal icon + label + arrow row cannot fit, so on phones the
                 tile stacks (`max-sm:flex-col`) into a chunky ~120px-tall tap target. */
              <Link
                key={category.id}
                href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                className="category-tile flex items-center gap-[15px] rounded-lg border border-border bg-canvas p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-sm:flex-col max-sm:items-start max-sm:gap-2.5 max-sm:p-3.5"
              >
                <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-tag-bg text-sm font-bold text-accent max-sm:size-9 max-sm:text-xs">
                  {categoryInitials(category.name)}
                </span>
                <span className="flex-1 max-sm:w-full max-sm:min-w-0">
                  <span className="block text-base font-semibold text-primary max-sm:text-sm max-sm:leading-snug max-sm:break-words">
                    {category.name}
                  </span>
                  {category.count !== null ? (
                    <span className="mono text-xs text-fg-muted">
                      {category.count} {category.count === 1 ? "listing" : "listings"}
                    </span>
                  ) : null}
                </span>
                {/* Decorative (aria-hidden) — dropped on phones so it does not eat a third row. */}
                <span className="text-fg-muted max-sm:hidden" aria-hidden>
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
