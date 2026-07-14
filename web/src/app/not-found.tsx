import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Custom 404 (Forms & Utility reference §04 "404") — renders for `notFound()` (e.g. an unknown
 * listing slug) and any unmatched route. The branded dark panel: `.panel-navy` + `.motif-grid`,
 * a mono `/404` label, the oversized mono `404` (middle zero in lavender), one line of copy and a
 * single white action back into the marketplace.
 *
 * Server Component inside the root layout (Header/Footer). It supplies its own `Container` — the
 * root layout no longer wraps pages in one, so the landing can be full-bleed.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  // The 404 is a root-level route, so it opts into the site chrome explicitly (the chrome moved out
  // of the root layout so the (auth) group can be chrome-free).
  return (
    <SiteChrome>
      <Container className="py-16">
      <div className="panel-navy relative overflow-hidden rounded-md border border-border">
        <div className="motif-grid absolute inset-0" aria-hidden />

        <div className="relative px-6 py-[clamp(48px,7vw,72px)] text-center">
          <p className="mono text-[11px] text-tag-bg">/404</p>

          <p className="mono mt-2 text-[clamp(3rem,9vw,5rem)] leading-none font-semibold text-canvas">
            4<span className="text-tag-bg">0</span>4
          </p>

          <h1 className="mt-4 text-[1.2rem] font-bold text-canvas">Page not found</h1>
          <p className="mx-auto mt-1.5 max-w-[36ch] text-sm leading-[1.5] text-canvas/70">
            The listing may have been sold, or the link is broken.
          </p>

          <Link
            href="/marketplace"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-6 border-canvas bg-canvas text-primary-emphasis hover:border-tag-bg hover:bg-tag-bg",
            )}
          >
            Back to marketplace
          </Link>
        </div>
        </div>
      </Container>
    </SiteChrome>
  );
}
