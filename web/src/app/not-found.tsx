import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

import { Blankslate } from "@/components/marketplace/Blankslate";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Custom 404 (S5.02) — renders for `notFound()` (e.g. an unknown listing slug) and any unmatched
 * route. Server Component inside the root layout (Header/Footer), using the Primer `Blankslate` +
 * 06_UI_System.md tokens with paths back into the app. It supplies its own `Container` (the root
 * layout no longer wraps pages in one, so the landing can be full-bleed).
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="py-16">
      <Blankslate
        icon={<Compass className="size-8" />}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to home
            </Link>
            <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline" }))}>
              Browse the marketplace
            </Link>
          </div>
        }
      />
    </Container>
  );
}
