import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

import { formatCompactMoney, type FeaturedProduct } from "@/lib/catalog";

/**
 * Hero — approved landing design. Copy column + the navy gradient-mesh visual with the card cluster.
 *
 * The cards are now REAL LISTINGS: the three highest-priced published products (`fetchTopPriced`,
 * server-side, ISR-cached), the most expensive one as the prominent front card, each linking to its
 * `/listing/{slug}`. They used to be illustrative art with invented names (Inboxly / Shipgrid /
 * Cronbase) — so they are no longer `aria-hidden`, and the panel is now a labelled region rather
 * than decoration. Only the mesh, the code-grid motif and the front card's bar chart remain
 * decorative.
 *
 * TWO VISUALS, ONE PER FORM FACTOR. The desktop cluster (three overlapping absolutely-positioned
 * cards) is composed for a ≥370px canvas: on a phone the cards overlap each other and eat half the
 * screen, so it is `hidden md:block` and a PURPOSE-BUILT mobile visual (`md:hidden`) takes its place
 * — the same navy mesh + code motif, but the single top listing in normal flow. Nothing is
 * absolutely positioned there, so nothing can overlap or overflow at 360px.
 *
 * FAIL-SOFT: `products` comes from a fail-soft fetch, so it can be short or empty. Fewer than three
 * products → only the available cards render (the cluster is composed back-to-front, so the front
 * card is the one that always exists). Zero → the visual is omitted entirely and the hero is the
 * copy column alone. We never invent a listing to fill the space.
 *
 * Everything else in the hero is the ONE copy column, re-tuned for phones with `max-md:` classes
 * (type scale, full-width stacked CTAs, and the trust line as a bordered 3-up block instead of a
 * ragged dot-separated wrap). No base class was changed, so md+ renders exactly as approved.
 */

/** The three inline proof figures under the CTAs. Static marketing copy, as designed. */
const HERO_STATS = [
  { value: "$2.4M", label: "in deals" },
  { value: "180", label: "vetted listings" },
  { value: "12k+", label: "buyers" },
];

/** The design's compact mono figures: asking price from cents, MRR from dollars. */
const askingOf = (product: FeaturedProduct) =>
  formatCompactMoney((product.price_cents ?? 0) / 100, product.currency);

export function Hero({ products }: { products: FeaturedProduct[] }) {
  // Composed back-to-front: `front` is the priciest listing and is the only card guaranteed to
  // exist, so a 1- or 2-product catalog degrades by dropping the cards BEHIND it, not the hero card.
  const [front, second, third] = products;

  return (
    <section className="mesh-hero relative">
      {/* Mobile-first: one column. The two-column split is the DESKTOP layout (lg+) — an auto-fit
          track with a 370px floor overflowed the container on any phone. */}
      <div className="container-page grid grid-cols-1 items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)] max-md:gap-9 max-md:pt-9 max-md:pb-11 lg:grid-cols-2">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-[13px] py-1.5 text-[13px] font-semibold text-tag-fg">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Curated micro-SaaS marketplace
          </span>

          {/* Two-tone headline: solid navy line, then the payoff line in the royal-blue → violet
              gradient (`.text-gradient-accent`, clipped to the glyphs). */}
          {/* Phones get their own headline scale: the desktop clamp bottoms out at 2.1rem, which is
              set for a 370px+ column, not for a 328px one. */}
          <h1 className="mt-[22px] text-[clamp(2.1rem,5vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-primary max-md:mt-5 max-md:text-[clamp(2.15rem,6.5vw,2.75rem)] max-md:leading-[1.06]">
            Skip the build.
            <br />
            <span className="text-gradient-accent">Buy the business.</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-[clamp(1.05rem,1.5vw,1.28rem)] leading-[1.55] text-fg-muted max-md:mt-4 max-md:text-[1rem] max-md:leading-[1.6]">
            Why spend two years building what you can own today? Acquire a vetted, profitable
            micro-SaaS with real customers — every listing verified for real MRR, clean churn, and
            audited code. Buy with confidence. Exit without the noise.
          </p>

          {/* Touch: the two CTAs go full-width and stack, rather than sitting as two shrink-to-fit
              pills that wrap onto two ragged lines anyway. Both are already ~54px tall. */}
          <div className="mt-[34px] flex flex-wrap gap-3.5 max-md:mt-7 max-md:flex-col">
            <Link
              href="/marketplace"
              className="shadow-cta-hover-lg rounded-md border border-primary bg-primary px-7 py-[15px] text-base font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:w-full max-md:text-center"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-border bg-canvas px-7 py-[15px] text-base font-semibold text-primary transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:w-full max-md:text-center"
            >
              List your SaaS
            </Link>
          </div>

          {/* Trust line. On desktop: one dot-separated inline row. On phones that row wrapped into
              three ragged lines with dots stranded at line starts — so below md the separators are
              dropped and the same three figures become a bordered 3-up block that reads as one
              cohesive proof strip. Same content, composed for the width. */}
          <div className="mt-7 flex flex-wrap items-center gap-[11px] text-sm text-fg-muted max-md:mt-8 max-md:grid max-md:grid-cols-3 max-md:gap-0 max-md:overflow-hidden max-md:rounded-[10px] max-md:border max-md:border-border max-md:bg-canvas/70">
            {HERO_STATS.map((stat, index) => (
              <span
                key={stat.label}
                className="flex items-center gap-[11px] max-md:flex-col max-md:items-start max-md:gap-0.5 max-md:px-3 max-md:py-3 max-md:[&:not(:first-child)]:border-l max-md:[&:not(:first-child)]:border-border"
              >
                {index > 0 ? (
                  <span className="size-1 rounded-full bg-border max-md:hidden" aria-hidden />
                ) : null}
                <span className="mono font-semibold text-primary max-md:text-[15px]">
                  {stat.value}
                </span>
                <span className="max-md:text-[11px] max-md:leading-tight">{stat.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── MOBILE visual (< md) ───────────────────────────────────────────
            The phone counterpart to the desktop cluster: same navy gradient mesh, same code-grid
            motif, same brand chip — but ONE real listing (the priciest), in normal flow. No absolute
            positioning, no overlap, no fixed widths, so it cannot overflow a 360px screen. The
            floating animations are deliberately omitted here (they exist to make a stack of
            overlapping cards feel alive; a single card just needs to sit well). */}
        {front ? (
          <section
            aria-label="Top listing"
            className="mesh-hero-visual shadow-hero-visual relative overflow-hidden rounded-[14px] p-4 md:hidden"
          >
            <div className="grid-motif-hero absolute inset-0" aria-hidden />

            <div className="shadow-chip relative inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-[7px] text-xs font-bold text-tag-fg">
              <Check className="size-[13px] text-accent" strokeWidth={3} aria-hidden />
              Code-audited &amp; verified
            </div>

            <Link
              href={`/listing/${front.slug}`}
              className="shadow-float-lg relative mt-4 block rounded-xl bg-canvas p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-center justify-between gap-2">
                {front.category ? (
                  <span className="truncate rounded-md bg-tag-bg px-2.5 py-1 text-[11px] font-semibold text-tag-fg">
                    {front.category.name}
                  </span>
                ) : (
                  <span />
                )}
                <span className="inline-flex flex-none items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <ShieldCheck className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
                  Vetted
                </span>
              </div>

              <div className="mt-3 text-[20px] leading-tight font-bold break-words text-primary">
                {front.title}
              </div>
              <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-fg-muted">
                {front.tagline}
              </div>

              {/* Decorative growth sparkline — the shape is art, not the product's real series. */}
              <div className="mt-4 flex h-[38px] items-end gap-[5px]" aria-hidden>
                {[36, 50, 44].map((height, i) => (
                  <div
                    key={`m-l-${i}`}
                    className="flex-1 rounded-[2px] bg-tag-bg"
                    style={{ height: `${height}%` }}
                  />
                ))}
                {[66, 82, 100].map((height, i) => (
                  <div
                    key={`m-h-${i}`}
                    className="flex-1 rounded-[2px] bg-accent"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3.5">
                {front.mrr !== null ? (
                  <div>
                    <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">MRR</div>
                    <div className="mono text-[15px] font-semibold text-primary">
                      {formatCompactMoney(front.mrr, front.currency)}
                    </div>
                  </div>
                ) : (
                  <span />
                )}
                <div className="text-right">
                  <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">Asking</div>
                  <div className="mono text-[15px] font-semibold text-primary">
                    {askingOf(front)}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        ) : null}

        {/* ── DESKTOP visual (md+): gradient mesh + floating card cluster ─────
            The approved composition — three overlapping cards, back to front — now carrying the
            three priciest REAL listings instead of invented ones. Geometry, animations, shadows and
            opacities are exactly as designed; only the content and the links are new. The absolutely
            positioned cards need ≥ ~370px to sit correctly, so this is hidden below md. */}
        {front ? (
          <section
            aria-label="Top listings"
            className="mesh-hero-visual shadow-hero-visual relative hidden min-h-[480px] overflow-hidden rounded-[14px] md:block"
          >
            <div className="grid-motif-hero absolute inset-0" aria-hidden />

            {/* Back card — the 3rd priciest. Omitted when the catalog is smaller. */}
            {third ? (
              <Link
                href={`/listing/${third.slug}`}
                className="anim-float-b shadow-float-sm absolute top-[58px] right-[34px] w-[250px] rounded-[10px] bg-canvas/90 px-[17px] py-[15px] opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate rounded-md bg-tag-bg px-2 py-[3px] text-[11px] font-semibold text-tag-fg">
                    {third.category?.name ?? "Micro-SaaS"}
                  </span>
                  <span className="mono flex-none text-xs text-fg-muted">{askingOf(third)}</span>
                </div>
                <div className="mt-2 truncate text-[15px] font-semibold text-primary">
                  {third.title}
                </div>
              </Link>
            ) : null}

            {/* Middle card — the 2nd priciest. Omitted when the catalog is smaller. */}
            {second ? (
              <Link
                href={`/listing/${second.slug}`}
                className="anim-float-c shadow-float-md absolute top-[168px] right-[70px] w-[270px] rounded-[11px] bg-canvas/95 px-[18px] py-4 opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate rounded-md bg-tag-bg px-2 py-[3px] text-[11px] font-semibold text-tag-fg">
                    {second.category?.name ?? "Micro-SaaS"}
                  </span>
                  <span className="mono flex-none text-xs text-fg-muted">{askingOf(second)}</span>
                </div>
                <div className="mt-2 truncate text-[15px] font-semibold text-primary">
                  {second.title}
                </div>
              </Link>
            ) : null}

            {/* Front card — THE most expensive listing. */}
            <Link
              href={`/listing/${front.slug}`}
              className="anim-float-a shadow-float-lg absolute bottom-[42px] left-8 block w-[308px] max-w-[calc(100%-56px)] rounded-xl bg-canvas p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate rounded-md bg-tag-bg px-2.5 py-1 text-[11px] font-semibold text-tag-fg">
                  {front.category?.name ?? "Micro-SaaS"}
                </span>
                <span className="inline-flex flex-none items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <ShieldCheck className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
                  Vetted
                </span>
              </div>

              <div className="mt-[13px] text-[21px] leading-tight font-bold break-words text-primary">
                {front.title}
              </div>
              <div className="mt-1 line-clamp-2 text-[13px] text-fg-muted">{front.tagline}</div>

              {/* Decorative growth sparkline — the shape is art, not the product's real series. */}
              <div className="mt-4 flex h-[42px] items-end gap-[5px]" aria-hidden>
                {[36, 50, 44].map((height, i) => (
                  <div
                    key={`l-${i}`}
                    className="flex-1 rounded-[2px] bg-tag-bg"
                    style={{ height: `${height}%` }}
                  />
                ))}
                {[66, 82, 100].map((height, i) => (
                  <div
                    key={`h-${i}`}
                    className="flex-1 rounded-[2px] bg-accent"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3.5">
                {/* MRR is omitted rather than zeroed when the listing has no metrics. */}
                {front.mrr !== null ? (
                  <div>
                    <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">MRR</div>
                    <div className="mono text-base font-semibold text-primary">
                      {formatCompactMoney(front.mrr, front.currency)}
                    </div>
                  </div>
                ) : (
                  <span />
                )}
                <div className="text-right">
                  <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">Asking</div>
                  <div className="mono text-base font-semibold text-primary">{askingOf(front)}</div>
                </div>
              </div>
            </Link>

            {/* Corner chip */}
            <div className="shadow-chip absolute top-[26px] left-[26px] inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-[7px] text-xs font-bold text-tag-fg">
              <Check className="size-[13px] text-accent" strokeWidth={3} aria-hidden />
              Code-audited &amp; verified
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
