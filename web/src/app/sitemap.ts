import type { MetadataRoute } from "next";

import { apiUrl } from "@/lib/apiBase";

/**
 * sitemap.xml (S5.01) — the static public routes plus every published listing. Product slugs are
 * pulled from the frozen `GET /api/products` contract (12_API_Specification.md), fail-soft exactly
 * like the home/listing fetches: on a missing env var, network error, or non-2xx it yields just the
 * static routes, and the product URLs light up once the endpoint responds. Revalidated hourly.
 *
 * Only routes that actually exist are listed — the legal/how-it-works pages have no `page.tsx` yet,
 * so they are intentionally omitted until they are built.
 */
export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

type ProductSlug = { slug: string; published_at?: string | null };

async function fetchProductSlugs(): Promise<ProductSlug[]> {
  const url = apiUrl("/products?sort=newest&per_page=100");
  if (!url) return [];
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ProductSlug[] };
    return Array.isArray(json?.data) ? json.data.filter((p) => p?.slug) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/marketplace`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/sell`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/guidelines`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const products = await fetchProductSlugs();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/listing/${product.slug}`,
    lastModified: product.published_at ? new Date(product.published_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
