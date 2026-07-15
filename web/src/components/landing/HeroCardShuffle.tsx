"use client";

import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { formatCompactMoney, revenueMultiple, type FeaturedProduct } from "@/lib/catalog";

/**
 * HeroCardShuffle — the auto-rotating 3D card deck in the hero visual.
 *
 * WHAT IT DOES. Up to six of the top-priciest real listings are laid out as a stack of physical
 * cards. Every ~4.5s the front card is "dealt away" — it lifts, tilts back in Z and fades into the
 * deck — while the card behind it rises forward into the hero position and the whole stack re-settles
 * one place. It cycles forever.
 *
 * HOW THE MOTION WORKS. Each card is permanently rendered; it is only ever assigned one of a small
 * set of fixed layered "slot" poses (a tilted front card, two offset cards angled behind it, and a
 * faded deep pose) — the exact original cluster. Advancing the active index shifts every card down
 * one slot (cyclically) so cards move THROUGH the poses, and a CSS transition on
 * `transform`/`opacity`/`filter` animates each card from its old pose to its new one. Because the
 * poses are fixed and the moves are cyclic-adjacent, the only dramatic move is the front card wrapping
 * to the deep pose — which reads as it receding into the deck. An overshooting cubic-bezier gives the
 * dealt-card settle; opacity resolves faster than the move so the z-index re-order is masked; blur
 * eases on its own curve; and a per-slot `transition-delay` staggers the cards so they don't move in
 * lockstep. GPU-composited throughout — no layout is read or written during the animation.
 *
 * MICRO-DETAILS. The grid motif parallaxes a few px each shuffle; the newly-fronted card regrows its
 * chart bars (staggered) and sweeps a soft royal glow (opacity-only) — both keyed off `data-front`.
 *
 * INTERACTION. Pauses on hover / focus / touch so a card can be read and clicked, then resumes
 * (touch resumes after a short rest). Every VISIBLE card is a real `/listing/{slug}` anchor: keyboard
 * focusable, aria-labelled with the product, visible focus ring, a hover lift and a tap-scale — and
 * because each card owns its own href, a click mid-shuffle always navigates to the right product.
 * The deep (invisible) cards are `aria-hidden`, untabbable and click-through.
 *
 * REDUCED MOTION. `prefers-reduced-motion` stops the auto-rotation (the index never advances) and the
 * CSS disables the transitions/keyframes, so the hero settles into a clean STATIC layered composition
 * — identical to the non-animated design.
 *
 * SSR/HYDRATION. The active index starts at 0 on both server and client and the poses are pure
 * functions of it, so the hydrated markup matches the server exactly; the timer starts only in an
 * effect (client-only).
 */

type Variant = "mobile" | "desktop";

const ROTATE_MS = 4500;

/** The most cards we deal from — enough variety without overloading the composited layers. */
const MAX_CARDS = 6;

/** How many slots are visible (0 = front, 1 = middle, 2 = back); slots ≥ this are the faded deck. */
const VISIBLE_SLOTS = 3;

const askingOf = (p: FeaturedProduct) =>
  formatCompactMoney((p.price_cents ?? 0) / 100, p.currency);

/**
 * The fixed slot poses — index 0 = front, 1 = middle, 2 = back — REPRODUCING THE ORIGINAL LAYERED
 * CLUSTER: a prominent front card sitting low and tilted one way with strong elevation, a second card
 * offset up-and-across and tilted the OTHER way, and a softer third further up/back. Index 3 is the
 * faded "in the deck" pose every slot ≥ 3 collapses to (including the just-dealt front card, which
 * recedes up-and-back into it).
 *
 * Depth is pure transform + filter, so it composites on the GPU: `scale` shrinks the card AND its
 * box-shadow together (back cards read as lower elevation for free), `rotate` is a 2D tilt with a
 * VARIED direction per slot — like the original, not a uniform head-on 3D fan — and `blur`/`opacity`
 * deepen the recede. The rotation only moves cards THROUGH these poses, so at every frame the cluster
 * is the original overlapping, angled, three-dimensional composition.
 */
const SLOTS: Record<Variant, { t: string; blur: number; opacity: number }[]> = {
  desktop: [
    { t: "translate(-44px, 48px) rotate(-3deg) scale(1)", blur: 0, opacity: 1 },
    { t: "translate(46px, -4px) rotate(3.5deg) scale(0.9)", blur: 1, opacity: 0.92 },
    { t: "translate(92px, -58px) rotate(-2.5deg) scale(0.82)", blur: 2.5, opacity: 0.6 },
    { t: "translate(122px, -102px) rotate(4deg) scale(0.74)", blur: 4, opacity: 0 },
  ],
  mobile: [
    { t: "translate(-10px, 22px) rotate(-2.5deg) scale(1)", blur: 0, opacity: 1 },
    { t: "translate(16px, -12px) rotate(3deg) scale(0.9)", blur: 1, opacity: 0.9 },
    { t: "translate(-6px, -42px) rotate(-2deg) scale(0.8)", blur: 2.5, opacity: 0.55 },
    { t: "translate(12px, -64px) rotate(3.5deg) scale(0.72)", blur: 4, opacity: 0 },
  ],
};

/** Per-slot stagger (ms). The deep/leaving card (index 3) starts first; the rising front settles last. */
const SLOT_DELAY = [90, 60, 30, 0];

export function HeroCardShuffle({
  products,
  variant,
}: {
  products: FeaturedProduct[];
  variant: Variant;
}) {
  const cards = products.slice(0, MAX_CARDS);
  const n = cards.length;

  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotation. Skipped entirely for a single card or under reduced-motion; the interval keeps
  // firing while paused but simply doesn't advance, so resuming needs no restart.
  useEffect(() => {
    if (n <= 1) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      if (!pausedRef.current) setActive((i) => (i + 1) % n);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [n]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  };
  const resume = () => {
    pausedRef.current = false;
  };
  // Focus can move between cards inside the deck; only resume when it leaves the deck entirely.
  const onBlurCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resume();
  };
  // Touch: let the tapped card rest a beat before the rotation picks back up.
  const resumeSoon = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 3000);
  };

  if (n === 0) return null;

  const isDesktop = variant === "desktop";
  const slots = SLOTS[variant];
  const cardW = isDesktop ? "w-[300px]" : "w-[272px]";
  const motifShift = active % 2 === 0 ? "-6px" : "6px";

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={onBlurCapture}
      onTouchStart={pause}
      onTouchEnd={resumeSoon}
    >
      {/* Grid motif — parallaxes a few px each shuffle. */}
      <div
        className="grid-motif-hero hero-motif absolute inset-0"
        aria-hidden
        style={{ transform: `translate3d(${motifShift}, 0, 0)` }}
      />

      {/* The stage — cards are centred here and pushed into their slot poses by transform. */}
      <div className="absolute inset-0">
        {cards.map((product, i) => {
          const slot = (i - active + n) % n;
          const pose = slots[Math.min(slot, slots.length - 1)];
          const hidden = slot >= VISIBLE_SLOTS;
          const isFront = slot === 0;
          const multiple = revenueMultiple(product.price_cents ?? 0, product.mrr);

          return (
            <div
              key={product.slug}
              className="hero-shuffle-card absolute top-1/2 left-1/2"
              data-front={isFront ? "true" : undefined}
              aria-hidden={hidden ? true : undefined}
              style={{
                transform: `translate(-50%, -50%) ${pose.t}`,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                zIndex: 50 - slot * 8,
                transitionDelay: `${SLOT_DELAY[Math.min(slot, SLOT_DELAY.length - 1)]}ms`,
              }}
            >
              <Link
                href={`/listing/${product.slug}`}
                aria-label={`View listing: ${product.title} — asking ${askingOf(product)}`}
                tabIndex={hidden ? -1 : undefined}
                className={`hero-card-inner ${cardW} relative block overflow-hidden rounded-xl bg-canvas ${
                  isDesktop ? "p-5" : "p-4"
                } shadow-float-lg transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  hidden ? "pointer-events-none" : ""
                }`}
              >
                {/* Soft royal entry glow — opacity-only, pulses when this card reaches the front. */}
                <span className="hero-glow" aria-hidden />

                <div className="flex items-center justify-between gap-2">
                  <span className="truncate rounded-md bg-tag-bg px-2.5 py-1 text-[11px] font-semibold text-tag-fg">
                    {product.category?.name ?? "Micro-SaaS"}
                  </span>
                  <span className="inline-flex flex-none items-center gap-1.5 text-[11px] font-semibold text-primary">
                    <ShieldCheck className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
                    Vetted
                  </span>
                </div>

                <div
                  className={`mt-3 ${
                    isDesktop ? "text-[21px]" : "text-[20px]"
                  } leading-tight font-bold break-words text-primary`}
                >
                  {product.title}
                </div>
                <div
                  className={`mt-1 ${
                    isDesktop ? "line-clamp-2" : "line-clamp-1"
                  } text-[13px] leading-snug text-fg-muted`}
                >
                  {product.tagline}
                </div>

                {/* Growth sparkline — decorative; the bars rise in when the card is dealt to front. */}
                <div
                  className={`mt-4 flex ${isDesktop ? "h-[42px]" : "h-[38px]"} items-end gap-[5px]`}
                  aria-hidden
                >
                  {[36, 50, 44, 66, 82, 100].map((height, b) => (
                    <div
                      key={b}
                      className={`hero-bar flex-1 rounded-[2px] ${b < 3 ? "bg-tag-bg" : "bg-accent"}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* Pay-vs-earn hierarchy: ASKING (what you pay) is the dominant navy figure; MRR
                    (what it earns) is a smaller, muted supporting metric, omitted when absent. */}
                <div className="mt-4 border-t border-border pt-3.5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">
                        Asking price
                      </div>
                      <div className="mono text-[22px] leading-none font-bold text-primary">
                        {askingOf(product)}
                      </div>
                    </div>
                    {product.mrr !== null ? (
                      <div className="text-right">
                        <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">
                          MRR /mo
                        </div>
                        <div
                          className={`mono ${
                            isDesktop ? "text-sm" : "text-[13px]"
                          } font-medium text-fg-muted`}
                        >
                          {formatCompactMoney(product.mrr, product.currency)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {multiple ? (
                    <div className="mono mt-1.5 text-[10px] text-fg-muted">{multiple}</div>
                  ) : null}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
