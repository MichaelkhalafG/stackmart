import Link from "next/link";
import { Check } from "lucide-react";

import type { FeaturedProduct } from "@/lib/catalog";

import { HeroCardShuffle } from "./HeroCardShuffle";

/**
 * Hero — copy column + the navy gradient-mesh visual (an auto-rotating card shuffle, see
 * `HeroCardShuffle`). Separate mobile (`md:hidden`) and desktop (`hidden md:grid`) layouts, each with
 * its own fixed-height shuffle panel. `products` is fail-soft: zero → the visual is omitted.
 */

/** the three inline proof figures — static marketing copy. */
const HERO_STATS = [
  { value: "$2.4M", label: "in deals" },
  { value: "180", label: "vetted listings" },
  { value: "12k+", label: "buyers" },
];

export function Hero({ products }: { products: FeaturedProduct[] }) {
  const hasListings = products.length > 0;

  return (
    <section className="mesh-hero relative">
      {/* Mobile hero (<md): badge → headline → subhead → shuffle → CTAs → trust. */}
      <div className="container-page pt-6 pb-9 md:hidden">
        <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-1 text-xs font-semibold text-tag-fg">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Curated micro-SaaS marketplace
        </span>

        {/* Phone-sized clamp (the desktop 2.1rem floor overflows a 328px column). */}
        <h1 className="mt-4 text-[clamp(2rem,7vw,2.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-primary">
          Skip the build.
          <br />
          <span className="text-gradient-accent">Buy the business.</span>
        </h1>

        {/* Short mobile-only subhead — the desktop paragraph runs to four lines on a phone. */}
        <p className="mt-3 text-[15px] leading-[1.5] text-fg-muted">
          Acquire a vetted, profitable micro-SaaS — verified MRR, clean churn, audited code.
        </p>

        {/* Fixed-height panel so the shuffle never shifts the CTAs below it; clips receding cards. */}
        {hasListings ? (
          <section
            aria-label="Top listings"
            className="mesh-hero-visual shadow-hero-visual relative mt-5 h-[340px] overflow-hidden rounded-[14px]"
          >
            <div className="shadow-chip absolute top-4 left-4 z-30 inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-[7px] text-xs font-bold text-tag-fg">
              <Check className="size-[13px] text-accent" strokeWidth={3} aria-hidden />
              Code-audited &amp; verified
            </div>
            <HeroCardShuffle variant="mobile" products={products} />
          </section>
        ) : null}

        {/* Equal-width CTAs, ≥44px tall. No `whitespace-nowrap` — a forced wrap grows height, not overflow. */}
        <div className="mt-5 flex gap-3">
          <Link
            href="/marketplace"
            className="shadow-cta-hover-lg flex min-h-11 flex-1 items-center justify-center rounded-md border border-primary bg-primary px-4 text-[15px] font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Browse listings
          </Link>
          <Link
            href="/sell"
            className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-border bg-canvas px-4 text-[15px] font-semibold text-primary transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            List your SaaS
          </Link>
        </div>

        {/* Trust numbers — 3-across strip, each cell centered with a divider between. */}
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-canvas/70">
          {HERO_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-3.5 text-center ${
                index > 0 ? "border-l border-border" : ""
              }`}
            >
              <span className="mono text-[17px] leading-none font-semibold text-primary">
                {stat.value}
              </span>
              <span className="text-[11px] leading-tight text-fg-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop hero (md+): single column from md, two-column split at lg. */}
      <div className="container-page hidden grid-cols-1 items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)] md:grid lg:grid-cols-2">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-[13px] py-1.5 text-[13px] font-semibold text-tag-fg">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Curated micro-SaaS marketplace
          </span>

          {/* Two-tone headline — navy line, then payoff line in the accent gradient. */}
          <h1 className="mt-[22px] text-[clamp(2.1rem,5vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-primary">
            Skip the build.
            <br />
            <span className="text-gradient-accent">Buy the business.</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-[clamp(1.05rem,1.5vw,1.28rem)] leading-[1.55] text-fg-muted">
            Why spend two years building what you can own today? Acquire a vetted, profitable
            micro-SaaS with real customers — every listing verified for real MRR, clean churn, and
            audited code. Buy with confidence. Exit without the noise.
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3.5">
            <Link
              href="/marketplace"
              className="shadow-cta-hover-lg rounded-md border border-primary bg-primary px-7 py-[15px] text-base font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-border bg-canvas px-7 py-[15px] text-base font-semibold text-primary transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              List your SaaS
            </Link>
          </div>

          {/* Trust line — one dot-separated inline row. */}
          <div className="mt-7 flex flex-wrap items-center gap-[11px] text-sm text-fg-muted">
            {HERO_STATS.map((stat, index) => (
              <span key={stat.label} className="flex items-center gap-[11px]">
                {index > 0 ? (
                  <span className="size-1 rounded-full bg-border" aria-hidden />
                ) : null}
                <span className="mono font-semibold text-primary">{stat.value}</span>
                <span>{stat.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Desktop visual (md+): fixed min-height panel; clips the dealt cards to it. */}
        {hasListings ? (
          <section
            aria-label="Top listings"
            className="mesh-hero-visual shadow-hero-visual relative hidden min-h-[480px] overflow-hidden rounded-[14px] md:block"
          >
            <div className="shadow-chip absolute top-[26px] left-[26px] z-30 inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-[7px] text-xs font-bold text-tag-fg">
              <Check className="size-[13px] text-accent" strokeWidth={3} aria-hidden />
              Code-audited &amp; verified
            </div>
            <HeroCardShuffle variant="desktop" products={products} />
          </section>
        ) : null}
      </div>
    </section>
  );
}
