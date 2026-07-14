import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { formatCompactMoney, type FeaturedProduct } from "@/lib/catalog";

/**
 * The designed featured-listing card, driven by REAL catalog data.
 *
 * The preview panel carries the coding-themed micro-animation from the design: a pulsing status
 * dot, a blinking terminal cursor, and one of three "workload" motifs (revenue bars / order tiles /
 * a spinning job ring) chosen by index, exactly as the three cards differ in the spec.
 *
 * Hover lifts the border + shadow only (`.listing-card`) — no transform, and the "View listing"
 * button is ALWAYS visible, so there is zero layout shift.
 *
 * Server-safe (no hooks). Animations are pure CSS keyframes, so nothing differs between the server
 * and client render — no hydration warnings.
 */

/** The three preview motifs + terminal lines from the design, cycled across the grid. */
const MOTIFS = ["bars", "tiles", "spinner"] as const;
const TERMINAL_LINES = ["$ mrr --live", "$ orders --tail", "$ cron --status"] as const;

function PreviewMotif({ variant }: { variant: (typeof MOTIFS)[number] }) {
  if (variant === "tiles") {
    return (
      <div className="mt-2.5 grid grid-cols-3 gap-[5px]">
        <div className="h-[22px] rounded-[3px] bg-tag-bg" />
        <div className="h-[22px] rounded-[3px] bg-tag-bg" />
        <div className="h-[22px] rounded-[3px] bg-accent" />
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className="mt-3 flex items-center gap-2">
        <span className="anim-spin-ring size-[26px] rounded-full border-[3px] border-tag-bg border-t-accent" />
        <span className="flex flex-1 flex-col gap-[5px]">
          <span className="h-[5px] rounded-[3px] bg-tag-bg" />
          <span className="h-[5px] w-[70%] rounded-[3px] bg-tag-bg" />
        </span>
      </div>
    );
  }

  // "bars" — the revenue sparkline.
  return (
    <div className="mt-2.5 flex h-[26px] items-end gap-1">
      {[40, 62].map((height, i) => (
        <div key={`l-${i}`} className="flex-1 rounded-[2px] bg-tag-bg" style={{ height: `${height}%` }} />
      ))}
      {[52, 84, 100].map((height, i) => (
        <div key={`h-${i}`} className="flex-1 rounded-[2px] bg-accent" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function ListingCard({ product, index = 0 }: { product: FeaturedProduct; index?: number }) {
  const motif = MOTIFS[index % MOTIFS.length];
  const terminal = TERMINAL_LINES[index % TERMINAL_LINES.length];
  const initials = product.title.slice(0, 2);

  const asking = formatCompactMoney(product.price_cents / 100, product.currency);
  const mrr = product.mrr !== null ? formatCompactMoney(product.mrr, product.currency) : null;

  return (
    <Link
      href={`/listing/${product.slug}`}
      className="listing-card group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* ── Preview panel with the coding micro-animation ─────────────────── */}
      <div className="relative flex h-[132px] items-center justify-center border-b border-border bg-[linear-gradient(140deg,var(--tag-bg),var(--canvas-subtle))]">
        {product.is_featured ? (
          <span className="absolute top-3.5 left-3.5 inline-flex items-center rounded-md bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
            Featured
          </span>
        ) : null}

        <div className="shadow-preview w-[74%] rounded-lg border border-border bg-canvas px-[13px] py-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex size-[22px] items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
              {initials}
            </span>
            <span className="h-1.5 flex-1 rounded-[3px] bg-tag-bg" />
            <span className="anim-pulse-dot size-[7px] flex-none rounded-full bg-accent" />
          </div>

          <PreviewMotif variant={motif} />

          <div className="mono mt-2 flex items-center gap-1 text-[9px] text-primary">
            <span>{terminal}</span>
            <span className="anim-blink h-[9px] w-[5px] flex-none bg-accent" />
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {/* Flex column so real taglines of differing length still bottom-align the price row and
          the CTA across the grid (the design assumed single-line taglines). */}
      <div className="flex flex-1 flex-col p-5">
        {/* `max-sm:flex-wrap`: a long category name can drop "Verified" to its own line on a phone
            instead of squashing it. */}
        <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
          {product.category ? (
            <span className="rounded-md bg-tag-bg px-2.5 py-1 text-xs font-semibold text-tag-fg">
              {product.category.name}
            </span>
          ) : (
            <span aria-hidden />
          )}
          <span className="inline-flex flex-none items-center gap-1.5 text-xs font-semibold text-accent">
            <ShieldCheck className="size-[15px]" strokeWidth={2.4} aria-hidden />
            Verified
          </span>
        </div>

        {/* `break-words` so an unbroken long title (e.g. a bare domain) wraps instead of overflowing
            the 360px card. Mobile-only; the card is `overflow-hidden`. */}
        <h3 className="mt-[15px] text-[1.4rem] font-bold text-primary max-sm:break-words">
          {product.title}
        </h3>
        {/* One extra tagline line on phones — the card is full-width and single-column there, so the
            taller body cannot desync the price row across a grid row. */}
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-[1.5] text-fg-muted max-sm:line-clamp-3">
          {product.tagline}
        </p>

        {/* `max-sm:flex-wrap`: with a large MRR + asking price the two figures wrap onto separate
            lines on a phone rather than compressing into each other. */}
        <div className="mt-[18px] flex items-baseline justify-between gap-3 border-t border-border pt-4 max-sm:flex-wrap">
          {mrr ? (
            <>
              <div>
                <div className="text-[11px] tracking-[0.06em] text-fg-muted uppercase">
                  Monthly revenue
                </div>
                <div className="mono text-[26px] font-semibold tracking-[-0.02em] text-primary">
                  {mrr}
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-sm text-primary">{asking}</div>
                <div className="mt-0.5 text-[11px] text-fg-muted">asking</div>
              </div>
            </>
          ) : (
            /* No MRR published for this listing — show the asking price as the primary figure. */
            <div>
              <div className="text-[11px] tracking-[0.06em] text-fg-muted uppercase">Price</div>
              <div className="mono text-[26px] font-semibold tracking-[-0.02em] text-primary">
                {asking}
              </div>
            </div>
          )}
        </div>

        {/* Always visible — never revealed on hover, so the card never reflows.
            On phones it becomes a centered flex box with a guaranteed 48px height (> the 44px tap
            minimum); it is already full-width in both cases. */}
        <span className="mt-[18px] block rounded-md bg-primary py-[11px] text-center text-[15px] font-semibold text-primary-foreground transition-colors duration-150 group-hover/card:bg-primary-emphasis max-sm:flex max-sm:min-h-[48px] max-sm:items-center max-sm:justify-center">
          View listing →
        </span>
      </div>
    </Link>
  );
}
