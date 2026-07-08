import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "STACKMART — buy ready-made micro-SaaS",
    template: "%s · STACKMART",
  },
  description:
    "A curated marketplace for ready-made micro-SaaS products, web apps, and codebases — evaluate via live demo and repository links, then buy instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Font + base colors come from globals.css (system stack, canvas/fg tokens).
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex-1">
          <Container className="py-6">{children}</Container>
        </main>
        <Footer />
      </body>
    </html>
  );
}
