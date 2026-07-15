import Link from "next/link";
import { Check } from "lucide-react";

import type { FeaturedProduct } from "@/lib/catalog";

import { HeroCardShuffle } from "./HeroCardShuffle";

/**
 * Hero — approved landing design. Copy column + the navy gradient-mesh visual with the card cluster.
 *
 * The visual is an AUTO-ROTATING 3D CARD SHUFFLE of the top-priciest real listings (see
 * `HeroCardShuffle`): the front card is dealt away and recedes into the deck while the next listing
 * rises forward, cycling every ~4.5s, pausing on hover/touch/focus, and holding a static composition
 * under `prefers-reduced-motion`. Every visible card is a real focusable link to `/listing/{slug}`.
 *
 * TWO HEROES, ONE PER FORM FACTOR — below `md` a purpose-built mobile hero renders (`md:hidden`) and
 * the approved desktop hero (`hidden md:grid`) is untouched. Each hosts its own `HeroCardShuffle`
 * sized to its panel; both panels are FIXED-HEIGHT, so the animation never shifts page layout. Mobile
 * order: badge → headline → short subhead → shuffle visual → side-by-side CTAs → trust row.
 *
 * FAIL-SOFT: `products` is a fail-soft fetch; zero products → the visual panel is omitted and the
 * hero is the copy column alone. We never invent a listing to fill the space.
 */

/** The three inline proof figures. Static marketing copy, as designed. */
const HERO_STATS = [
  { value: "$2.4M", label: "in deals" },
  { value: "180", label: "vetted listings" },
  { value: "12k+", label: "buyers" },
];

export function Hero({ products }: { products: FeaturedProduct[] }) {
  // The hero visual renders whenever there is at least one listing; the shuffle itself degrades to a
  // static single card for a thin catalog and to nothing for an empty one.
  const hasListings = products.length > 0;

  return (
    <section className="mesh-hero relative">
      {/* ══ MOBILE hero (< md) — purpose-built to land as one first screen ══════════════════════
          Order: badge → headline → short subhead → shuffle visual → side-by-side CTAs → trust. */}
      <div className="container-page pt-6 pb-9 md:hidden">
        <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-1 text-xs font-semibold text-tag-fg">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Curated micro-SaaS marketplace
        </span>

        {/* Sized for a phone column: the desktop clamp bottoms out at 2.1rem, set for a ≥370px
            column, not a 328px one. Same two-tone headline, gradient on the payoff line. */}
        <h1 className="mt-4 text-[clamp(2rem,7vw,2.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-primary">
          Skip the build.
          <br />
          <span className="text-gradient-accent">Buy the business.</span>
        </h1>

        {/* Short, mobile-only subhead — the desktop paragraph runs to four lines on a phone. Same
            value prop, one tight line. (The desktop copy below is unchanged.) */}
        <p className="mt-3 text-[15px] leading-[1.5] text-fg-muted">
          Acquire a vetted, profitable micro-SaaS — verified MRR, clean churn, audited code.
        </p>

        {/* Auto-rotating card shuffle on the navy mesh panel. Fixed height so the animation never
            shifts the CTAs/trust below it; `overflow-hidden` clips the receding cards to the panel. */}
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

        {/* CTAs side by side, equal width, ≥44px tall (min-h-11). No `whitespace-nowrap`: at any
            width the labels fit on one line, and if a narrower phone ever forced a wrap they grow
            in height together rather than overflowing. */}
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

        {/* Trust numbers — a tidy 3-across strip, everything CENTER-aligned. Each cell centers its
            mono figure over a muted label, with even padding and clean vertical dividers, so the row
            reads as one intentional block instead of three cramped left-hung numbers. */}
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

      {/* ══ DESKTOP hero (md+) — the approved design ════════════════════════════════════════════
          Single column from md, two-column split at lg. Hidden below md, where the mobile hero above
          takes over. Only the visual changed: the static floating cluster is now the card shuffle. */}
      <div className="container-page hidden grid-cols-1 items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)] md:grid lg:grid-cols-2">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-[13px] py-1.5 text-[13px] font-semibold text-tag-fg">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Curated micro-SaaS marketplace
          </span>

          {/* Two-tone headline: solid navy line, then the payoff line in the royal-blue → violet
              gradient (`.text-gradient-accent`, clipped to the glyphs). */}
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

        {/* ── DESKTOP visual (md+): gradient mesh + auto-rotating card shuffle ─────
            Fixed min-height panel; `overflow-hidden` clips the dealt cards to it. */}
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
