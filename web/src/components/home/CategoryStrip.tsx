import Link from "next/link";

/** A category as returned by `GET /api/categories` (12_API_Specification.md). */
export type Category = { id: number; name: string; slug: string; sort_order?: number };

/**
 * Category strip (S2.01). Token-styled pills linking to `/marketplace?category=<slug>` so the
 * marketplace (S2.02) can read the filter from the URL. Falls back to a muted line when the
 * categories endpoint isn't reachable yet, keeping the section present.
 */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-5 text-xl font-semibold tracking-tight text-fg">Browse by category</h2>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
              className="inline-flex items-center rounded-md border border-border bg-canvas px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">
          Categories will appear here once the catalog is published.
        </p>
      )}
    </section>
  );
}
