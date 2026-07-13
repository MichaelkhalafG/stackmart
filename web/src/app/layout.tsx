import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchCategoriesWithCounts, fetchFeatured } from "@/lib/catalog";

/**
 * Site-wide brand faces (06 §1 Typography), self-hosted by next/font at build time — no external
 * <link>, no render-blocking request, no extra package. Each exposes a CSS variable that globals.css
 * feeds into --font-sans / --font-mono, so every page and component inherits them automatically.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk", // variable font — no explicit weight list needed
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"], // not a variable font — weights must be declared
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "MDN STACKMART — buy ready-made micro-SaaS",
    template: "%s · MDN STACKMART",
  },
  description:
    "A curated marketplace for ready-made micro-SaaS products, web apps, and codebases — evaluate via live demo and repository links, then buy instantly.",
};

/**
 * Root layout.
 *
 * The header's mega-menu is data-driven, so the categories (with their real listing counts) and the
 * top featured listing are fetched HERE, server-side and ISR-cached, then handed to the client
 * `Header`. Fetches are fail-soft — an unreachable API just yields an empty menu, never an error.
 *
 * NOTE: `<main>` is intentionally NOT wrapped in `<Container>`. The landing design is full-bleed
 * (edge-to-edge colour bands and gradient meshes), so the 1280px container now lives in the
 * per-section layouts — `(auth)`, `(account)`, `checkout`, `marketplace`, `listing`, `sell` — which
 * keeps every other page's width and padding exactly as before.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, featured] = await Promise.all([fetchCategoriesWithCounts(), fetchFeatured(1)]);

  // Base colors come from globals.css; the two font variables below feed --font-sans / --font-mono.
  return (
    <html lang="en" className={`h-full ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Header categories={categories} promo={featured[0] ?? null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
