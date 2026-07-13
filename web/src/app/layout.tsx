import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Base colors come from globals.css; the two font variables below feed --font-sans / --font-mono.
  return (
    <html lang="en" className={`h-full ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Header />
          <main className="flex-1">
            <Container className="py-6">{children}</Container>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
