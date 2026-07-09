import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Home hero (S2.01). Headline + subcopy + the page's single solid (navy `primary`) CTA to
 * `/marketplace`, plus a secondary outline link. There is NO Buy Now on the home page — Buy
 * Now lives only on the listing detail (S2.03). Tokens only, shadcn `buttonVariants` as-is.
 */
export function Hero() {
  return (
    <section className="flex flex-col items-start gap-5 border-b border-border py-12 sm:py-16">
      <span className="inline-flex items-center rounded-full border border-border bg-canvas-subtle px-3 py-1 text-xs font-medium text-fg-muted">
        Curated micro-SaaS marketplace
      </span>

      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-fg text-balance sm:text-4xl">
        Buy ready-made micro-SaaS products, web apps, and codebases.
      </h1>

      <p className="max-w-2xl text-base text-fg-muted sm:text-lg">
        Browse vetted listings, evaluate with a live demo and a repository review, then buy
        instantly — you receive the full source code as a secure download plus a license key.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link href="/marketplace" className={cn(buttonVariants({ size: "lg" }))}>
          Browse the marketplace
        </Link>
        <Link
          href="/how-it-works"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          How it works
        </Link>
      </div>
    </section>
  );
}
