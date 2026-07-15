import type { Metadata } from "next";

import { fetchCategoriesWithCounts, fetchFeatured, fetchTopPriced } from "@/lib/catalog";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FeaturedListings } from "@/components/landing/FeaturedListings";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SellCta } from "@/components/landing/SellCta";
import { Testimonials } from "@/components/landing/Testimonials";
import { TrustStats } from "@/components/landing/TrustStats";
import { DEFAULT_OG_IMAGE, OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";

const HOME_DESCRIPTION =
  "A curated marketplace for ready-made micro-SaaS products, web apps, and codebases — evaluate via live demo and repository links, then buy instantly with full source code + a license key.";

export const metadata: Metadata = {
  title: "Buy ready-made micro-SaaS products, web apps & codebases",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "MDN STACKMART — buy ready-made micro-SaaS",
    description: HOME_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "MDN STACKMART — buy ready-made micro-SaaS",
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Home `/` — the approved landing design (feat/landing-redesign), rebuilt in React.
 *
 * Server Component with ISR (08_Frontend_Architecture.md §2). Sections in the design's order:
 * hero → trust/stats band → featured listings → how it works → testimonials → categories →
 * seller CTA. (Header + footer come from the root layout.)
 *
 * DATA: featured listings and the categories grid are LIVE from the catalog API; the trust/stats
 * band is intentionally static marketing copy (see TrustStats). Fetches are fail-soft — the page
 * renders with empty-state lines if the API is unreachable.
 */
// Must be a static literal — Next cannot statically analyse an imported constant here.
// Keep in sync with CATALOG_REVALIDATE in @/lib/catalog (the fetch-level cache window).
export const revalidate = 300;

/** The design's featured grid is a row of three. */
const FEATURED_LIMIT = 3;

/** The hero shuffle cycles through the top listings — deal from the priciest six for variety. */
const HERO_LIMIT = 6;

export default async function HomePage() {
  const [featured, categories, topPriced] = await Promise.all([
    fetchFeatured(FEATURED_LIMIT),
    fetchCategoriesWithCounts(),
    fetchTopPriced(HERO_LIMIT),
  ]);

  return (
    <>
      <WebsiteJsonLd />
      <OrganizationJsonLd />

      <Hero products={topPriced} />
      <TrustStats />
      <FeaturedListings products={featured} />
      <HowItWorks />
      <Testimonials />
      <SellCta />
      <CategoryGrid categories={categories} />
      
    </>
  );
}
