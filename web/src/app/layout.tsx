import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

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
 * Root layout — `<html>`, `<body>`, fonts and client providers ONLY.
 *
 * It deliberately does NOT render the navbar/footer. A child layout cannot escape its parent in the
 * App Router, so while the chrome lived here every route inherited it — including the auth routes,
 * which must be standalone full-page screens. The chrome now lives in `<SiteChrome>`, and each route
 * group opts in:
 *
 *   (public)   → SiteChrome   (landing, marketplace, listing, sell, guidelines…)
 *   (account)  → SiteChrome + the client auth guard
 *   checkout   → SiteChrome
 *   not-found  → SiteChrome
 *   (auth)     → NO chrome — full-viewport standalone auth screens
 *
 * `<Container>` is still applied per-section (the landing is full-bleed), unchanged.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Base colors come from globals.css; the two font variables below feed --font-sans / --font-mono.
  return (
    <html lang="en" className={`h-full ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
