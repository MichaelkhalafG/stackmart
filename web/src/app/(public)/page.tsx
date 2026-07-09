import type { Metadata } from "next";

import { apiUrl } from "@/lib/apiBase";
import { CategoryStrip, type Category } from "@/components/home/CategoryStrip";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SellCta } from "@/components/home/SellCta";
import { TrustStrip } from "@/components/home/TrustStrip";
import type { ProductListItem } from "@/components/product/MarketplaceCard";

const HOME_DESCRIPTION =
  "A curated marketplace for ready-made micro-SaaS products, web apps, and codebases — evaluate via live demo and repository links, then buy instantly with full source code + a license key.";

export const metadata: Metadata = {
  title: "Buy ready-made micro-SaaS products, web apps & codebases",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "STACKMART — buy ready-made micro-SaaS",
    description: HOME_DESCRIPTION,
    siteName: "STACKMART",
  },
  twitter: {
    card: "summary_large_image",
    title: "STACKMART — buy ready-made micro-SaaS",
    description: HOME_DESCRIPTION,
  },
};

/**
 * Home `/` — public Server Component with ISR (08_Frontend_Architecture.md §2). Fetches the
 * frozen catalog contract (12_API_Specification.md) directly on the server with no token, and
 * revalidates on a fixed interval. There is NO Buy Now on this page (that's the listing detail,
 * S2.03).
 */
export const revalidate = 300;

const FEATURED_LIMIT = 6;

type ListResponse<T> = { data?: T[] };

/**
 * Server-side fetch against the frozen contract. The catalog endpoints are owned by the 
 * (J2.01/J2.03) and may not be live while the frontend is built in parallel, so every fetch is
 * fail-soft: on a missing env var, network error, or non-2xx it resolves to `[]` and the page
 * renders its Blankslate sections. The page lights up automatically once the endpoint responds.
 * The URL is resolved via `apiUrl()` so it always hits `<origin>/api/...` (trailing-slash safe).
 */
async function fetchList<T>(path: string): Promise<T[]> {
  const url = apiUrl(path);
  if (!url) return [];
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as ListResponse<T>;
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

/** Prefer flagged featured products; fall back to the newest listings if none are flagged. */
function pickFeatured(products: ProductListItem[]): ProductListItem[] {
  const featured = products.filter((product) => product.is_featured);
  const source = featured.length > 0 ? featured : products;
  return source.slice(0, FEATURED_LIMIT);
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchList<ProductListItem>("/products?sort=newest"),
    fetchList<Category>("/categories"),
  ]);

  const featured = pickFeatured(products);

  return (
    <>
      <Hero />
      <FeaturedListings products={featured} />
      <CategoryStrip categories={categories} />
      <HowItWorks />
      <TrustStrip />
      <SellCta />
    </>
  );
}
