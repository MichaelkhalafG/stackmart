import { apiUrl } from "@/lib/apiBase";
import type { ProductListItem } from "@/components/product/MarketplaceCard";

/**
 * Server-side catalog data layer for the public pages (landing + header).
 *
 * Every fetch is FAIL-SOFT: a missing NEXT_PUBLIC_API_URL, a network error, or a non-2xx
 * resolves to an empty result instead of throwing, so the page still renders (the sections
 * degrade to their empty state and light up as soon as the API responds). All requests are
 * ISR-cached on the same interval as the pages that use them. Env-driven — no hardcoded host.
 */

/** Revalidate window shared by the landing page and the root layout's header data. */
export const CATALOG_REVALIDATE = 300;

/** A category as returned by `GET /api/categories` (12_API_Specification.md). */
export type Category = { id: number; name: string; slug: string; sort_order?: number };

/** A category plus the REAL number of published listings in it (derived — see below). */
export type CategoryWithCount = Category & { count: number | null };

/** Metrics block from `GET /api/products/{slug}`. `mrr`/`profit` are DOLLARS (see MetricsGrid). */
type ProductMetrics = { mrr?: number | null; users?: number | null; profit?: number | null } | null;

/** A featured product enriched with its MRR, which the LIST contract does not carry. */
export type FeaturedProduct = ProductListItem & { mrr: number | null };

type ListResponse<T> = { data?: T[]; meta?: { total?: number } };
type ItemResponse<T> = { data?: T };

async function getJson<T>(path: string): Promise<T | null> {
  const url = apiUrl(path);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: CATALOG_REVALIDATE },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** `GET /api/categories` — the real category list. */
export async function fetchCategories(): Promise<Category[]> {
  const json = await getJson<ListResponse<Category>>("/categories");
  return Array.isArray(json?.data) ? json.data : [];
}

/** `GET /api/products` — a page of the published catalog (the frozen list shape). */
export async function fetchProducts(query = "?sort=newest"): Promise<ProductListItem[]> {
  const json = await getJson<ListResponse<ProductListItem>>(`/products${query}`);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Real per-category listing counts.
 *
 * `GET /api/categories` deliberately does NOT leak product counts (CategoryResource), and the
 * design shows a count on every category tile + mega-menu row. Rather than invent a number, we
 * read the paginator's `meta.total` from `GET /api/products?category=<slug>` — one small,
 * ISR-cached request per category, run in parallel. `null` means "unknown" (API unreachable), and
 * the UI simply omits the count line rather than showing a wrong one.
 */
export async function fetchCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = await fetchCategories();

  return Promise.all(
    categories.map(async (category) => {
      const json = await getJson<ListResponse<ProductListItem>>(
        `/products?category=${encodeURIComponent(category.slug)}`,
      );
      const total = json?.meta?.total;
      return { ...category, count: typeof total === "number" ? total : null };
    }),
  );
}

/**
 * Featured products for the landing grid, enriched with MRR.
 *
 * The list contract has no `metrics`, so for each featured product we read `metrics.mrr` from the
 * detail endpoint (`GET /api/products/{slug}`) — real seeded data, never mocked. Products flagged
 * `is_featured` win; if none are flagged we fall back to the newest listings so the section is
 * never empty. Returns fewer than `limit` when fewer exist.
 */
export async function fetchFeatured(limit: number): Promise<FeaturedProduct[]> {
  const products = await fetchProducts("?sort=newest");
  const flagged = products.filter((product) => product.is_featured);
  const picked = (flagged.length > 0 ? flagged : products).slice(0, limit);

  return withMrr(picked);
}

/**
 * The highest-priced published listings — the hero's card cluster.
 *
 * Sorted by the API, not by us: `GET /products?sort=price_desc` is an already-frozen, already-tested
 * value of the `sort` enum (`newest|price_asc|price_desc`), so this needed no API change. Sorting
 * in-page would have been wrong anyway — the endpoint paginates at 12, so we would only ever be
 * ranking the first page, not the catalog.
 *
 * Enriched with MRR from the detail endpoint (the list contract carries no `metrics`), because the
 * hero's front card shows MRR alongside the asking price. Returns fewer than `limit` when fewer
 * exist, and `[]` if the API is unreachable — the hero then falls back to its own composition.
 */
export async function fetchTopPriced(limit: number): Promise<FeaturedProduct[]> {
  const products = await fetchProducts("?sort=price_desc");

  return withMrr(products.slice(0, limit));
}

/** Attach `metrics.mrr` (dollars) from `GET /products/{slug}` — `null` when absent/unreachable. */
async function withMrr(products: ProductListItem[]): Promise<FeaturedProduct[]> {
  return Promise.all(
    products.map(async (product) => {
      const json = await getJson<ItemResponse<{ metrics?: ProductMetrics }>>(
        `/products/${encodeURIComponent(product.slug)}`,
      );
      const mrr = json?.data?.metrics?.mrr;
      return { ...product, mrr: typeof mrr === "number" ? mrr : null };
    }),
  );
}

/**
 * Two-letter badge for a category tile / mega-menu row, derived from the real name:
 * "AI Tools" → "AI", "E-commerce" → "EC", "Productivity" → "Pr". Mirrors the design's badges.
 */
export function categoryInitials(name: string): string {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name.slice(0, 2).charAt(0).toUpperCase() + name.slice(1, 2).toLowerCase()).trim();
}

/**
 * Compact money for the design's mono figures: 12400 → "$12.4k", 420000 → "$420k".
 * Intl yields an uppercase "K"; the design uses a lowercase "k" (millions stay "M").
 */
export function formatCompactMoney(dollars: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(dollars)
    .replace(/K$/, "k");
}
