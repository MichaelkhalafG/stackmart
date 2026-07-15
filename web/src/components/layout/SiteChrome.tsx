import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchCategoriesWithCounts, fetchFeatured } from "@/lib/catalog";

/**
 * The site chrome — navbar + page slot + footer.
 *
 * This USED to live in the root layout, which meant every route inherited it, including the auth
 * routes. The auth screens are standalone full-page experiences (no navbar, no footer), and a child
 * layout cannot escape its parent in the App Router — so the chrome moved down one level: the root
 * layout now only owns `<html>`/`<body>`/providers, and each route group that WANTS the chrome
 * opts in by rendering this component. The `(auth)` group simply doesn't.
 *
 * The header's mega-menu is data-driven, so the categories (with their real listing counts) and the
 * top featured listing are fetched HERE, server-side and ISR-cached — exactly as the root layout
 * did before. Fetches are fail-soft: an unreachable API yields an empty menu, never an error.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [categories, featured] = await Promise.all([fetchCategoriesWithCounts(), fetchFeatured(1)]);

  return (
    <>
      <Header categories={categories} promo={featured[0] ?? null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
