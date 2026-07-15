import Link from "next/link";
import { Check } from "lucide-react";

/** Seller CTA band — approved landing design. Static copy on the deep-navy gradient mesh. */
const PERKS = ["No listing fees", "Confidential by default", "Vetted buyers only"];

/** The floating glass stat cards in the cluster. Static marketing figures, as designed. */
const FLOAT_STATS = [
  {
    label: "Average sale price",
    value: "$180k",
    pulse: true,
    className: "anim-float-a top-1.5 right-[4%] w-[236px]",
  },
  {
    label: "Time to first offer",
    value: "72h",
    pulse: false,
    className: "anim-float-c top-[150px] left-0 w-[214px]",
  },
  {
    label: "Avg. revenue multiple",
    value: "3.1×",
    pulse: false,
    className: "anim-float-b right-[16%] bottom-0.5 w-[222px]",
  },
];

export function SellCta() {
  return (
    <section id="sell" className="mesh-sell relative scroll-mt-20 overflow-hidden">
      <div className="grid-motif-sell absolute inset-0" aria-hidden />

      {/* Mobile-first single column; the two-column split is the desktop (lg+) layout.
          max-md: wider gutters (20px vs the container's 16px) and a lower vertical rhythm — both
          scoped below md, so the md/lg composition is untouched. */}
      <div className="relative container-page grid grid-cols-1 items-center gap-[clamp(48px,6vw,80px)] py-[clamp(76px,9vw,136px)] max-md:px-5 max-md:py-[clamp(56px,9vw,76px)] lg:grid-cols-2">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div className="max-w-[560px]">
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg/15 px-[13px] py-1.5 text-[13px] font-semibold text-tag-bg">
            For founders
          </span>

          <h2 className="mt-[22px] text-[clamp(2.05rem,4.6vw,3.9rem)] leading-[1.02] font-bold tracking-[-0.035em] text-canvas">
            Exit on
            <br />
            <span className="text-tag-bg">your terms.</span>
          </h2>

          <p className="mt-[22px] max-w-[500px] text-[clamp(1.05rem,1.5vw,1.24rem)] leading-[1.55] text-canvas/75">
            List your micro-SaaS once and reach thousands of pre-qualified acquirers. We handle
            vetting, valuation, and escrow — you stay in control right through the handover.
          </p>

          {/* Below sm the two CTAs stack full-width (56px tall, well over the 44px tap target). */}
          <div className="mt-9 flex flex-wrap gap-3.5 max-sm:flex-col">
            <Link
              href="/sell"
              className="shadow-cta-light rounded-md border border-canvas bg-canvas px-[30px] py-4 text-base font-semibold text-primary-emphasis transition-[background-color,box-shadow] duration-200 hover:bg-tag-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg max-sm:w-full max-sm:text-center"
            >
              List your SaaS
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-canvas/35 bg-transparent px-[30px] py-4 text-base font-semibold text-canvas transition-[border-color,background-color] duration-200 hover:border-canvas hover:bg-canvas/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg max-sm:w-full max-sm:text-center"
            >
              Talk to our team
            </Link>
          </div>

          {/* Below sm the proof points become one clean row each instead of a ragged 2-line wrap;
              the slightly stronger tint (75% vs 65% white) keeps them well clear of AA on the mesh. */}
          <div className="mt-[34px] flex flex-wrap gap-x-[22px] gap-y-3 text-sm text-canvas/65 max-sm:mt-7 max-sm:flex-col max-sm:items-start max-sm:text-canvas/75">
            {PERKS.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-2">
                <Check
                  className="size-[15px] text-tag-bg max-sm:shrink-0"
                  strokeWidth={3}
                  aria-hidden
                />
                {perk}
              </span>
            ))}
          </div>
        </div>

        {/* ── Floating stat cluster ──────────────────────────────────────────
            Decorative only (`aria-hidden`): the cards overlap each other below md, so it is hidden
            on phones rather than cramming 360px of overlapping glass into the viewport. */}
        <div className="relative hidden min-h-[360px] md:block" aria-hidden>
          <div className="absolute top-1/2 left-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-tag-bg/15" />
          <div className="absolute top-1/2 left-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl border border-accent/50" />

          {FLOAT_STATS.map((stat) => (
            <div
              key={stat.label}
              className={`shadow-glass absolute rounded-xl border border-canvas/15 bg-canvas/7 px-5 py-[18px] backdrop-blur-[10px] ${stat.className}`}
            >
              <div className="flex items-center gap-[7px] text-xs text-canvas/60">
                {stat.pulse ? (
                  <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" />
                ) : null}
                {stat.label}
              </div>
              <div className="mono mt-2 text-[30px] font-semibold tracking-[-0.02em] text-canvas">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
